-- Forward migration: Fix TFNG/Matching check_exercise_answer, lock down exercise_attempts, isolate mock vs practice attempts, and unify lesson progress.

begin;

-- ============================================================================
-- 1. (P0-07) Fix check_exercise_answer for true_false_not_given & matching_headings
-- ============================================================================
create or replace function public.check_exercise_answer(p_attempt_id uuid, p_question_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_attempt public.learner_attempts;
  target_question public.exercise_questions;
  target_answer public.learner_answers;
  answer_key private.exercise_answer_keys;
  review_allowed boolean;
  answer_correct boolean := false;
  selected_count integer;
  correct_count integer;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select attempts.* into target_attempt
  from public.learner_attempts as attempts
  where attempts.id = p_attempt_id and attempts.user_id = actor_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'attempt not found';
  end if;
  if target_attempt.status <> 'in_progress' then
    raise exception using errcode = '55000', message = 'attempt is not in progress';
  end if;

  select questions.* into target_question
  from public.exercise_questions as questions
  where questions.id = p_question_id
    and questions.exercise_set_version_id = target_attempt.exercise_set_version_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'question not found';
  end if;

  select answers.* into target_answer
  from public.learner_answers as answers
  where answers.attempt_id = target_attempt.id and answers.question_id = target_question.id;
  if not found then
    raise exception using errcode = 'P0002', message = 'answer not found';
  end if;

  select keys.* into answer_key
  from private.exercise_answer_keys as keys
  where keys.question_id = target_question.id;

  if target_question.question_type in (
    'single_choice',
    'true_false',
    'multiple_choice',
    'true_false_not_given',
    'matching_headings'
  ) then
    select count(*)::integer into selected_count
    from public.learner_answer_options as selections
    where selections.answer_id = target_answer.id;

    select count(*)::integer into correct_count
    from private.exercise_correct_options as expected
    where expected.question_id = target_question.id;

    answer_correct := selected_count = correct_count and not exists (
      select 1
      from public.learner_answer_options as selections
      where selections.answer_id = target_answer.id
        and not exists (
          select 1
          from private.exercise_correct_options as expected
          where expected.question_id = target_question.id
            and expected.option_id = selections.option_id
        )
    );
  else
    answer_correct := exists (
      select 1
      from private.exercise_correct_text_answers as expected
      where expected.question_id = target_question.id
        and expected.normalized_answer = private.normalize_exact_answer(
          target_answer.answer_text,
          answer_key.case_sensitive
        )
    );
  end if;

  select versions.allow_review into review_allowed
  from public.exercise_set_versions as versions
  where versions.id = target_attempt.exercise_set_version_id;

  return jsonb_build_object(
    'questionId', target_question.id,
    'isCorrect', answer_correct,
    'correctOptionIds', case when review_allowed then coalesce((
      select jsonb_agg(expected.option_id order by expected.option_id)
      from private.exercise_correct_options as expected
      where expected.question_id = target_question.id
    ), '[]'::jsonb) else null end,
    'acceptedTextAnswers', case when review_allowed then coalesce((
      select jsonb_agg(expected.answer_text order by expected.answer_text)
      from private.exercise_correct_text_answers as expected
      where expected.question_id = target_question.id
    ), '[]'::jsonb) else null end,
    'explanationMarkdown', case when review_allowed then answer_key.explanation_markdown else null end
  );
end;
$$;

revoke all on function public.check_exercise_answer(uuid, uuid) from public, anon;
grant execute on function public.check_exercise_answer(uuid, uuid) to authenticated;

-- ============================================================================
-- 2. (P0-07) Lock down public.exercise_attempts & replace draft/submit RPCs
-- ============================================================================
drop policy if exists "Users own attempts" on public.exercise_attempts;
drop policy if exists "Users can view own exercise attempts" on public.exercise_attempts;
drop policy if exists "Users can create in-progress exercise attempts" on public.exercise_attempts;

create policy "Users can view own exercise attempts"
on public.exercise_attempts
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can create in-progress exercise attempts"
on public.exercise_attempts
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'in_progress'
  and submitted_at is null
  and coalesce(score, 0) = 0
  and coalesce(accuracy_percentage, 0) = 0
);

revoke update, delete, truncate on table public.exercise_attempts from public, anon, authenticated;

create or replace function public.save_exercise_draft_json(
  p_attempt_id uuid,
  p_answers jsonb
)
returns public.exercise_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_attempt public.exercise_attempts;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_attempt_id is null or p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.char_length(p_answers::text) > 50000 then
    raise exception using errcode = '22023', message = 'invalid draft payload';
  end if;

  select ea.* into target_attempt
  from public.exercise_attempts as ea
  where ea.id = p_attempt_id and ea.user_id = actor_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Attempt not found';
  end if;
  if target_attempt.status <> 'in_progress' or target_attempt.submitted_at is not null then
    raise exception using errcode = '55000', message = 'Submitted or abandoned attempt is immutable';
  end if;
  if target_attempt.server_expires_at is not null
    and now() > (target_attempt.server_expires_at + interval '15 seconds') then
    update public.exercise_attempts as ea
    set status = 'abandoned', updated_at = now()
    where ea.id = p_attempt_id;
    raise exception using errcode = '55000', message = 'Time limit exceeded';
  end if;

  update public.exercise_attempts as ea
  set draft_answers = p_answers, updated_at = now()
  where ea.id = p_attempt_id
  returning ea.* into target_attempt;

  return target_attempt;
end;
$$;

revoke all on function public.save_exercise_draft_json(uuid, jsonb) from public, anon;
grant execute on function public.save_exercise_draft_json(uuid, jsonb) to authenticated;

create or replace function public.submit_exercise_attempt(
  p_attempt_id uuid,
  p_user_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_owner_id uuid;
  v_exercise_id uuid;
  v_expires_at timestamptz;
  v_status varchar(20);
  v_is_published boolean := false;
  v_total_questions integer := 0;
  v_correct_count integer := 0;
  v_accuracy numeric(5, 2) := 0;
  v_q record;
  v_is_correct boolean;
  v_result_details jsonb := '[]'::jsonb;
  v_raw_text text;
  v_normalized_user text;
begin
  if v_actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_user_answers is null or pg_catalog.jsonb_typeof(p_user_answers) <> 'object' then
    raise exception using errcode = '22023', message = 'invalid answers payload';
  end if;

  select ea.user_id, ea.exercise_id, ea.server_expires_at, ea.status, pe.is_published
  into v_owner_id, v_exercise_id, v_expires_at, v_status, v_is_published
  from public.exercise_attempts as ea
  join public.practice_exercises as pe on pe.id = ea.exercise_id
  where ea.id = p_attempt_id
  for update of ea;

  if not found then
    raise exception using errcode = 'P0002', message = 'Attempt not found';
  end if;
  if v_owner_id <> v_actor_id then
    raise exception using errcode = '42501', message = 'Unauthorized attempt access';
  end if;
  if not v_is_published then
    raise exception using errcode = '55000', message = 'Exercise is not published';
  end if;
  if v_status <> 'in_progress' then
    raise exception using errcode = '55000', message = 'Attempt has already been finalized';
  end if;

  if v_expires_at is not null and now() > (v_expires_at + interval '15 seconds') then
    update public.exercise_attempts as ea
    set status = 'abandoned', updated_at = now()
    where ea.id = p_attempt_id;
    raise exception using errcode = '55000', message = 'Time limit exceeded. Attempt marked as abandoned';
  end if;

  for v_q in
    select pq.id, pq.question_type, pq.explanation, ak.explanation_markdown
    from public.practice_questions as pq
    join private.exercise_answer_keys as ak on pq.id = ak.question_id
    where pq.exercise_id = v_exercise_id
    order by pq.order_index
  loop
    v_is_correct := false;

    if v_q.question_type in ('multiple_choice', 'matching') then
      v_is_correct := exists (
        select 1
        from private.exercise_correct_options as eco
        where eco.question_id = v_q.id
          and eco.option_id::text = (p_user_answers ->> v_q.id::text)
      );
    elsif v_q.question_type = 'fill_in_blanks' then
      v_raw_text := p_user_answers ->> v_q.id::text;
      v_normalized_user := private.normalize_exact_answer(v_raw_text, false);
      v_is_correct := exists (
        select 1
        from private.exercise_correct_text_answers as ect
        where ect.question_id = v_q.id
          and ect.normalized_answer = v_normalized_user
      );
    end if;

    if v_is_correct then
      v_correct_count := v_correct_count + 1;
    end if;

    v_result_details := v_result_details || jsonb_build_object(
      'question_id', v_q.id,
      'is_correct', v_is_correct,
      'explanation', coalesce(v_q.explanation, v_q.explanation_markdown)
    );
  end loop;

  select count(*)::integer into v_total_questions
  from public.practice_questions as pq
  where pq.exercise_id = v_exercise_id;

  v_accuracy := pg_catalog.round((v_correct_count::numeric / greatest(v_total_questions, 1)) * 100, 2);

  update public.exercise_attempts as ea
  set
    status = 'submitted',
    submitted_at = now(),
    score = v_correct_count,
    max_score = v_total_questions,
    accuracy_percentage = v_accuracy,
    draft_answers = p_user_answers,
    updated_at = now()
  where ea.id = p_attempt_id;

  return jsonb_build_object(
    'attempt_id', p_attempt_id,
    'score', v_correct_count,
    'max_score', v_total_questions,
    'accuracy_percentage', v_accuracy,
    'results', v_result_details
  );
end;
$$;

revoke all on function public.submit_exercise_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_exercise_attempt(uuid, jsonb) to authenticated;

-- ============================================================================
-- 3. (P1-08) Isolate Mock Test contexts from Practice contexts via is_mock
-- ============================================================================
alter table public.learner_attempts
  add column if not exists is_mock boolean not null default false;

alter table public.writing_submissions
  add column if not exists is_mock boolean not null default false;

alter table public.speaking_attempts
  add column if not exists is_mock boolean not null default false;

update public.learner_attempts as la
set is_mock = true
where exists (
  select 1 from public.mock_test_section_attempts as mtsa
  where mtsa.learner_attempt_id = la.id
);

update public.writing_submissions as ws
set is_mock = true
where exists (
  select 1 from public.mock_test_section_attempts as mtsa
  where mtsa.writing_submission_id = ws.id
);

update public.speaking_attempts as sa
set is_mock = true
where exists (
  select 1 from public.mock_test_section_attempts as mtsa
  where mtsa.speaking_attempt_id = sa.id
);

drop index if exists public.learner_attempts_one_active_set_idx;
create unique index learner_attempts_one_active_set_idx
on public.learner_attempts (user_id, exercise_set_id, is_mock)
where status = 'in_progress';

drop index if exists public.writing_submissions_one_active_task_idx;
create unique index writing_submissions_one_active_task_idx
on public.writing_submissions (user_id, writing_task_id, is_mock)
where status = 'draft';

drop index if exists public.speaking_attempts_one_active_set_idx;
create unique index speaking_attempts_one_active_set_idx
on public.speaking_attempts (user_id, speaking_set_id, is_mock)
where status = 'in_progress';

create or replace function public.protect_writing_submission()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    return old;
  end if;
  if old.status = 'submitted' then
    raise exception using errcode = '55000', message = 'submitted writing is immutable';
  end if;
  if old.user_id is distinct from new.user_id
    or old.writing_task_id is distinct from new.writing_task_id
    or old.writing_task_version_id is distinct from new.writing_task_version_id
    or old.is_mock is distinct from new.is_mock
    or old.started_at is distinct from new.started_at
    or old.expires_at is distinct from new.expires_at
    or old.start_idempotency_key is distinct from new.start_idempotency_key then
    raise exception using errcode = '55000', message = 'writing submission identity is immutable';
  end if;
  return new;
end;
$$;

create or replace function public.protect_speaking_attempt()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Speaking attempts cannot be deleted';
  end if;
  if old.user_id is distinct from new.user_id
    or old.speaking_set_id is distinct from new.speaking_set_id
    or old.speaking_set_version_id is distinct from new.speaking_set_version_id
    or old.is_mock is distinct from new.is_mock
    or old.started_at is distinct from new.started_at then
    raise exception 'Speaking attempt identity is immutable';
  end if;
  if old.status = 'submitted' and old is distinct from new then
    raise exception 'Submitted speaking attempts are immutable';
  end if;
  return new;
end;
$$;

create or replace function public.start_exercise_attempt(
  p_exercise_slug text,
  p_idempotency_key text
)
returns public.learner_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_set_id uuid;
  target_version_id uuid;
  target_domain text;
  target_time_limit integer;
  attempt_started_at timestamptz := now();
  result public.learner_attempts;
begin
  if actor_id is null then raise exception using errcode = '42501', message = 'authentication required'; end if;
  if p_exercise_slug is null or p_exercise_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'invalid exercise slug';
  end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = '' or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'invalid idempotency key';
  end if;
  if not (select private.completed_learner_exists()) then
    raise exception using errcode = '42501', message = 'completed onboarding required';
  end if;

  select sets.id, versions.id, sets.domain,
    coalesce(reading.time_limit_seconds, listening.time_limit_seconds)
  into target_set_id, target_version_id, target_domain, target_time_limit
  from public.exercise_sets as sets
  join public.exercise_set_versions as versions on versions.exercise_set_id = sets.id
  left join public.reading_practice_versions as reading on reading.exercise_set_version_id = versions.id
  left join public.listening_practice_versions as listening on listening.exercise_set_version_id = versions.id
  where sets.slug = p_exercise_slug
    and versions.status = 'published'
    and versions.published_at <= now()
    and (select private.exercise_version_is_accessible(versions.id));
  if target_version_id is null then
    raise exception using errcode = 'P0002', message = 'exercise not found';
  end if;

  select attempts.* into result
  from public.learner_attempts as attempts
  where attempts.user_id = actor_id and attempts.start_idempotency_key = p_idempotency_key;
  if found then
    if result.exercise_set_id <> target_set_id or result.is_mock then
      raise exception using errcode = '23505', message = 'idempotency key belongs to another exercise';
    end if;
    return result;
  end if;

  insert into public.learner_attempts (
    user_id,
    exercise_set_id,
    exercise_set_version_id,
    is_mock,
    start_idempotency_key,
    started_at,
    time_limit_seconds,
    reading_time_limit_seconds,
    expires_at
  ) values (
    actor_id,
    target_set_id,
    target_version_id,
    false,
    p_idempotency_key,
    attempt_started_at,
    target_time_limit,
    case when target_domain = 'reading' then target_time_limit else null end,
    case when target_time_limit is null then null else attempt_started_at + make_interval(secs => target_time_limit) end
  )
  on conflict (user_id, exercise_set_id, is_mock) where status = 'in_progress'
  do update set last_saved_at = now(), updated_at = now()
  returning * into result;
  return result;
end;
$$;

create or replace function public.start_writing_submission(
  p_task_slug text,
  p_idempotency_key text
)
returns public.writing_submissions
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_task_id uuid;
  target_version public.writing_task_versions;
  result public.writing_submissions;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_task_slug is null or p_task_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception using errcode = '22023', message = 'invalid writing task slug';
  end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = ''
    or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'invalid idempotency key';
  end if;
  if not (select private.completed_learner_exists()) then
    raise exception using errcode = '42501', message = 'completed onboarding required';
  end if;

  select versions.* into target_version
  from public.writing_tasks as tasks
  join public.writing_task_versions as versions on versions.writing_task_id = tasks.id
  join public.learner_profiles as learners on learners.user_id = actor_id
  where tasks.slug = p_task_slug
    and versions.status = 'published'
    and versions.published_at <= now()
    and (versions.test_type = 'both' or versions.test_type = learners.test_type)
  order by versions.version desc
  limit 1;
  if target_version.id is null then
    raise exception using errcode = 'P0002', message = 'writing task not found';
  end if;
  target_task_id := target_version.writing_task_id;

  select submissions.* into result
  from public.writing_submissions as submissions
  where submissions.user_id = actor_id
    and submissions.start_idempotency_key = p_idempotency_key;
  if found then
    if result.writing_task_id <> target_task_id or result.is_mock then
      raise exception using errcode = '23505', message = 'idempotency key belongs to another writing task';
    end if;
    return result;
  end if;

  select submissions.* into result
  from public.writing_submissions as submissions
  where submissions.user_id = actor_id
    and submissions.writing_task_id = target_task_id
    and submissions.is_mock = false
    and submissions.status = 'draft';
  if found then return result; end if;

  insert into public.writing_submissions (
    user_id,
    writing_task_id,
    writing_task_version_id,
    is_mock,
    start_idempotency_key,
    expires_at
  ) values (
    actor_id,
    target_task_id,
    target_version.id,
    false,
    p_idempotency_key,
    now() + make_interval(secs => target_version.time_limit_seconds)
  )
  on conflict (user_id, writing_task_id, is_mock) where status = 'draft' do nothing
  returning * into result;

  if result.id is null then
    select submissions.* into result
    from public.writing_submissions as submissions
    where submissions.user_id = actor_id
      and submissions.writing_task_id = target_task_id
      and submissions.is_mock = false
      and submissions.status = 'draft';
  end if;
  return result;
end;
$$;

create or replace function public.start_speaking_attempt(
  p_set_slug text,
  p_idempotency_key text
)
returns public.speaking_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_version public.speaking_set_versions;
  result public.speaking_attempts;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = '' or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception 'Invalid idempotency key';
  end if;

  select versions.* into target_version
  from public.speaking_sets as sets
  join public.speaking_set_versions as versions on versions.speaking_set_id = sets.id
  join public.learner_profiles as learners on learners.user_id = actor_id
  where sets.slug = p_set_slug
    and versions.status = 'published'
    and versions.published_at <= now()
    and learners.onboarding_completed_at is not null
    and (versions.test_type = 'both' or versions.test_type = learners.test_type)
  order by versions.version desc
  limit 1;
  if not found then raise exception 'Speaking set is not available'; end if;

  select sa.* into result
  from public.speaking_attempts as sa
  where sa.user_id = actor_id and sa.start_idempotency_key = p_idempotency_key;
  if found then
    if result.speaking_set_id <> target_version.speaking_set_id or result.is_mock then
      raise exception 'Idempotency key conflict';
    end if;
    return result;
  end if;

  select sa.* into result
  from public.speaking_attempts as sa
  where sa.user_id = actor_id
    and sa.speaking_set_id = target_version.speaking_set_id
    and sa.is_mock = false
    and sa.status = 'in_progress';
  if found then return result; end if;

  insert into public.speaking_attempts (
    user_id,
    speaking_set_id,
    speaking_set_version_id,
    is_mock,
    start_idempotency_key
  ) values (
    actor_id,
    target_version.speaking_set_id,
    target_version.id,
    false,
    p_idempotency_key
  ) returning * into result;
  return result;
end;
$$;

create or replace function public.start_mock_test_section(
  p_session_id uuid,
  p_section_id uuid,
  p_idempotency_key text
)
returns public.mock_test_section_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_session public.mock_test_sessions;
  target_section public.mock_test_sections;
  result public.mock_test_section_attempts;
  attempt public.learner_attempts;
  submission public.writing_submissions;
  speaking public.speaking_attempts;
  target_set_id uuid;
  target_task_id uuid;
  target_speaking_set_id uuid;
  target_domain text;
  section_started_at timestamptz := now();
  section_expires_at timestamptz;
begin
  if actor_id is null then raise exception using errcode = '42501', message = 'authentication required'; end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = '' or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'invalid idempotency key';
  end if;

  select * into target_session from public.mock_test_sessions
  where id = p_session_id and user_id = actor_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'mock session not found'; end if;
  if target_session.status <> 'in_progress' then raise exception using errcode = 'P0001', message = 'mock session is not editable'; end if;

  select * into target_section from public.mock_test_sections
  where id = p_section_id and mock_test_version_id = target_session.mock_test_version_id;
  if not found then raise exception using errcode = 'P0002', message = 'mock section not found'; end if;
  if target_session.current_section_order is distinct from target_section.section_order then
    raise exception using errcode = 'P0001', message = 'mock sections must be completed in order';
  end if;

  select * into result from public.mock_test_section_attempts
  where session_id = target_session.id and mock_test_section_id = target_section.id;
  if found then return result; end if;

  select * into result from public.mock_test_section_attempts
  where user_id = actor_id and start_idempotency_key = p_idempotency_key;
  if found then raise exception using errcode = '23505', message = 'idempotency key conflict'; end if;

  section_expires_at := section_started_at + make_interval(secs => target_section.time_limit_seconds);

  if target_section.section_type in ('reading', 'listening') then
    select versions.exercise_set_id, sets.domain into target_set_id, target_domain
    from public.exercise_set_versions as versions
    join public.exercise_sets as sets on sets.id = versions.exercise_set_id
    where versions.id = target_section.exercise_set_version_id;

    select * into attempt from public.learner_attempts as la
    where la.user_id = actor_id
      and la.exercise_set_id = target_set_id
      and la.is_mock = true
      and la.status = 'in_progress'
    for update;
    if found and (
      attempt.exercise_set_version_id <> target_section.exercise_set_version_id
      or exists (
        select 1 from public.mock_test_section_attempts as mtsa
        where mtsa.learner_attempt_id = attempt.id
      )
    ) then
      raise exception using errcode = '55000', message = 'finish or abandon the conflicting mock attempt first';
    end if;

    if not found then
      insert into public.learner_attempts (
        user_id, exercise_set_id, exercise_set_version_id, is_mock, start_idempotency_key,
        started_at, time_limit_seconds, reading_time_limit_seconds, expires_at
      ) values (
        actor_id, target_set_id, target_section.exercise_set_version_id, true, p_idempotency_key,
        section_started_at, target_section.time_limit_seconds,
        case when target_domain = 'reading' then target_section.time_limit_seconds else null end,
        section_expires_at
      ) returning * into attempt;
    else
      section_started_at := attempt.started_at;
      section_expires_at := attempt.expires_at;
    end if;
  elsif target_section.section_type = 'writing' then
    select writing_task_id into target_task_id
    from public.writing_task_versions
    where id = target_section.writing_task_version_id;

    select * into submission from public.writing_submissions as ws
    where ws.user_id = actor_id
      and ws.writing_task_id = target_task_id
      and ws.is_mock = true
      and ws.status = 'draft'
    for update;
    if found and (
      submission.writing_task_version_id <> target_section.writing_task_version_id
      or exists (
        select 1 from public.mock_test_section_attempts as mtsa
        where mtsa.writing_submission_id = submission.id
      )
    ) then
      raise exception using errcode = '55000', message = 'finish or abandon the conflicting mock writing draft first';
    end if;

    if not found then
      insert into public.writing_submissions (
        user_id, writing_task_id, writing_task_version_id, is_mock, start_idempotency_key,
        started_at, last_saved_at, expires_at
      ) values (
        actor_id, target_task_id, target_section.writing_task_version_id, true, p_idempotency_key,
        section_started_at, section_started_at, section_expires_at
      ) returning * into submission;
    else
      section_started_at := submission.started_at;
      section_expires_at := submission.expires_at;
    end if;
  else
    select speaking_set_id into target_speaking_set_id
    from public.speaking_set_versions
    where id = target_section.speaking_set_version_id;

    select * into speaking from public.speaking_attempts as sa
    where sa.user_id = actor_id
      and sa.speaking_set_id = target_speaking_set_id
      and sa.is_mock = true
      and sa.status = 'in_progress'
    for update;
    if found and (
      speaking.speaking_set_version_id <> target_section.speaking_set_version_id
      or exists (
        select 1 from public.mock_test_section_attempts as mtsa
        where mtsa.speaking_attempt_id = speaking.id
      )
    ) then
      raise exception using errcode = '55000', message = 'finish or abandon the conflicting mock speaking attempt first';
    end if;

    if not found then
      insert into public.speaking_attempts (
        user_id, speaking_set_id, speaking_set_version_id, is_mock, start_idempotency_key, started_at
      ) values (
        actor_id, target_speaking_set_id, target_section.speaking_set_version_id, true, p_idempotency_key, section_started_at
      ) returning * into speaking;
    else
      section_started_at := speaking.started_at;
    end if;
  end if;

  insert into public.mock_test_section_attempts (
    user_id, session_id, mock_test_version_id, mock_test_section_id, section_type,
    start_idempotency_key, learner_attempt_id, writing_submission_id, speaking_attempt_id,
    started_at, expires_at
  ) values (
    actor_id, target_session.id, target_session.mock_test_version_id, target_section.id, target_section.section_type,
    p_idempotency_key, attempt.id, submission.id, speaking.id, section_started_at, section_expires_at
  ) returning * into result;
  return result;
end;
$$;

revoke all on function public.start_exercise_attempt(text, text),
  public.start_writing_submission(text, text),
  public.start_speaking_attempt(text, text),
  public.start_mock_test_section(uuid, uuid, text) from public, anon;
grant execute on function public.start_exercise_attempt(text, text),
  public.start_writing_submission(text, text),
  public.start_speaking_attempt(text, text),
  public.start_mock_test_section(uuid, uuid, text) to authenticated;

-- ============================================================================
-- 4. (P1-10) Sync user_lesson_progress -> learner_lesson_progress
-- ============================================================================
create or replace function public.sync_user_lesson_progress_to_learner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version_id uuid;
  v_status text;
  v_percent numeric(5, 2);
  v_started_at timestamptz;
  v_last_accessed timestamptz;
  v_completed_at timestamptz;
begin
  if not exists (select 1 from public.profiles as p where p.id = new.user_id) then
    return new;
  end if;

  select lv.id into v_version_id
  from public.lesson_versions as lv
  where lv.lesson_id = new.lesson_id
  order by (lv.status = 'published') desc, lv.version desc
  limit 1;

  if v_version_id is null then
    return new;
  end if;

  v_status := case
    when new.status = 'completed' or coalesce(new.completion_percentage, 0) >= 100 then 'completed'
    else 'in_progress'
  end;
  v_percent := case
    when v_status = 'completed' then 100::numeric(5, 2)
    else least(greatest(coalesce(new.completion_percentage, 0), 0), 99)::numeric(5, 2)
  end;
  v_last_accessed := coalesce(new.updated_at, now());
  v_started_at := v_last_accessed;
  v_completed_at := case
    when v_status = 'completed' then greatest(coalesce(new.completed_at, v_last_accessed), v_started_at)
    else null
  end;

  insert into public.learner_lesson_progress (
    user_id,
    lesson_id,
    lesson_version_id,
    status,
    progress_percent,
    started_at,
    last_accessed_at,
    completed_at
  ) values (
    new.user_id,
    new.lesson_id,
    v_version_id,
    v_status,
    v_percent,
    v_started_at,
    v_last_accessed,
    v_completed_at
  )
  on conflict (user_id, lesson_id) do update set
    status = case
      when public.learner_lesson_progress.status = 'completed' then 'completed'
      else excluded.status
    end,
    progress_percent = case
      when public.learner_lesson_progress.status = 'completed' or excluded.status = 'completed' then 100::numeric(5, 2)
      else greatest(public.learner_lesson_progress.progress_percent, excluded.progress_percent)
    end,
    last_accessed_at = greatest(
      public.learner_lesson_progress.last_accessed_at,
      excluded.last_accessed_at,
      public.learner_lesson_progress.started_at
    ),
    completed_at = case
      when public.learner_lesson_progress.status = 'completed' then public.learner_lesson_progress.completed_at
      when excluded.completed_at is null then null
      else greatest(excluded.completed_at, public.learner_lesson_progress.started_at)
    end,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.sync_user_lesson_progress_to_learner() from public, anon, authenticated;

drop trigger if exists sync_user_lesson_progress_trigger on public.user_lesson_progress;
create trigger sync_user_lesson_progress_trigger
after insert or update on public.user_lesson_progress
for each row execute function public.sync_user_lesson_progress_to_learner();

-- Backfill any pre-existing user_lesson_progress rows safely
insert into public.learner_lesson_progress (
  user_id,
  lesson_id,
  lesson_version_id,
  status,
  progress_percent,
  started_at,
  last_accessed_at,
  completed_at
)
select
  ulp.user_id,
  ulp.lesson_id,
  lv.id as lesson_version_id,
  case when ulp.status = 'completed' or coalesce(ulp.completion_percentage, 0) >= 100 then 'completed' else 'in_progress' end,
  case when ulp.status = 'completed' or coalesce(ulp.completion_percentage, 0) >= 100 then 100::numeric(5, 2) else least(greatest(coalesce(ulp.completion_percentage, 0), 0), 99)::numeric(5, 2) end,
  coalesce(ulp.updated_at, now()),
  coalesce(ulp.updated_at, now()),
  case when ulp.status = 'completed' or coalesce(ulp.completion_percentage, 0) >= 100 then greatest(coalesce(ulp.completed_at, ulp.updated_at, now()), coalesce(ulp.updated_at, now())) else null end
from public.user_lesson_progress as ulp
join public.profiles as p on p.id = ulp.user_id
join lateral (
  select v.id
  from public.lesson_versions as v
  where v.lesson_id = ulp.lesson_id
  order by (v.status = 'published') desc, v.version desc
  limit 1
) as lv on true
on conflict (user_id, lesson_id) do nothing;

commit;
