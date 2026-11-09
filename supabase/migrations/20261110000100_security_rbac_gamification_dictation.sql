-- Forward migration: Security RBAC, Gamification atomic RPCs, Dictation hardening, Policy Acceptances.

begin;

-- ============================================================================
-- 1. (P0-01) Lock down public.app_roles & public.admin_users with RLS + invoker view
-- ============================================================================
alter table public.app_roles enable row level security;

revoke all on table public.app_roles from public, anon, authenticated;
grant select on table public.app_roles to authenticated, service_role;

drop policy if exists "Users can read own role" on public.app_roles;
create policy "Users can read own role"
on public.app_roles
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace view public.admin_users
with (security_invoker = true) as
select r.user_id
from public.app_roles as r
where r.role in ('super_admin', 'content_editor');

revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated, service_role;

comment on view public.admin_users is
  'Security-invoker view over app_roles. Learners can only observe their own admin status; full role management stays service_role only.';

-- ============================================================================
-- 2. (P0-04) Harden public.award_xp & add atomic public.buy_streak_freeze
-- ============================================================================
alter table public.user_gamification
  drop constraint if exists user_gamification_nonnegative_check,
  add constraint user_gamification_nonnegative_check check (
    total_xp >= 0
    and current_level >= 1
    and current_streak >= 0
    and longest_streak >= current_streak
    and streak_freezes_available between 0 and 5
  );

create or replace function public.award_xp(
  target_user_id uuid,
  xp_amount integer,
  xp_source text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_timezone text := 'Asia/Ho_Chi_Minh';
  v_today date;
  v_existing public.user_gamification;
  v_new_total integer;
  v_new_level integer;
  v_new_streak integer;
  v_new_longest integer;
  v_freezes integer;
begin
  if target_user_id is null then
    raise exception using errcode = '22023', message = 'target user id is required';
  end if;
  if xp_amount is null or xp_amount not between 1 and 500 then
    raise exception using errcode = '22023', message = 'xp amount must be between 1 and 500';
  end if;
  if xp_source is null or xp_source not in (
    'lesson_section_completed',
    'lesson_completed',
    'exercise_completed',
    'dictation_completed',
    'writing_submitted',
    'speaking_submitted',
    'mock_test_completed',
    'vocab_review_completed',
    'streak_bonus'
  ) then
    raise exception using errcode = '22023', message = 'invalid xp source';
  end if;

  select coalesce(nullif(pg_catalog.btrim(p.timezone), ''), 'Asia/Ho_Chi_Minh')
  into v_timezone
  from public.profiles as p
  where p.id = target_user_id;

  begin
    v_today := (now() at time zone coalesce(v_timezone, 'Asia/Ho_Chi_Minh'))::date;
  exception when others then
    v_today := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  end;

  insert into public.xp_events (user_id, amount, source)
  values (target_user_id, xp_amount, xp_source);

  select ug.* into v_existing
  from public.user_gamification as ug
  where ug.user_id = target_user_id
  for update;

  if not found then
    v_new_total := xp_amount;
    v_new_level := greatest(1, pg_catalog.floor(v_new_total / 100.0)::integer + 1);
    insert into public.user_gamification (
      user_id,
      total_xp,
      current_level,
      current_streak,
      longest_streak,
      last_activity_date,
      streak_freezes_available
    ) values (
      target_user_id,
      v_new_total,
      v_new_level,
      1,
      1,
      v_today,
      0
    );
    return;
  end if;

  v_new_total := v_existing.total_xp + xp_amount;
  v_new_level := greatest(1, pg_catalog.floor(v_new_total / 100.0)::integer + 1);
  v_freezes := v_existing.streak_freezes_available;

  if v_existing.last_activity_date is null then
    v_new_streak := 1;
  elsif v_existing.last_activity_date = v_today then
    v_new_streak := greatest(v_existing.current_streak, 1);
  elsif v_existing.last_activity_date = v_today - 1 then
    v_new_streak := v_existing.current_streak + 1;
  elsif v_existing.last_activity_date = v_today - 2 and v_freezes > 0 then
    v_freezes := v_freezes - 1;
    v_new_streak := v_existing.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_longest := greatest(v_existing.longest_streak, v_new_streak);

  update public.user_gamification as ug
  set
    total_xp = v_new_total,
    current_level = v_new_level,
    current_streak = v_new_streak,
    longest_streak = v_new_longest,
    last_activity_date = greatest(coalesce(ug.last_activity_date, v_today), v_today),
    streak_freezes_available = v_freezes,
    updated_at = now()
  where ug.user_id = target_user_id;
end;
$$;

revoke all on function public.award_xp(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.award_xp(uuid, integer, text) to service_role;

create or replace function public.buy_streak_freeze(p_cost integer default 500)
returns public.user_gamification
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  v_row public.user_gamification;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_cost is null or p_cost <> 500 then
    raise exception using errcode = '22023', message = 'invalid streak freeze cost';
  end if;

  select ug.* into v_row
  from public.user_gamification as ug
  where ug.user_id = actor_id
  for update;

  if not found or v_row.total_xp < p_cost then
    raise exception using errcode = 'P0001', message = 'insufficient xp balance for streak freeze';
  end if;
  if v_row.streak_freezes_available >= 5 then
    raise exception using errcode = 'P0001', message = 'maximum streak freeze inventory reached';
  end if;

  update public.user_gamification as ug
  set
    total_xp = ug.total_xp - p_cost,
    streak_freezes_available = ug.streak_freezes_available + 1,
    updated_at = now()
  where ug.user_id = actor_id
  returning ug.* into v_row;

  insert into public.xp_events (user_id, amount, source)
  values (actor_id, -p_cost, 'buy_streak_freeze');

  return v_row;
end;
$$;

revoke all on function public.buy_streak_freeze(integer) from public, anon;
grant execute on function public.buy_streak_freeze(integer) to authenticated;

-- ============================================================================
-- 3. (P0-05) Harden Dictation RPCs & Lock down dictation_progress / dictation_attempts
-- ============================================================================
drop policy if exists "Users can manage own progress" on public.dictation_progress;
create policy "Users can view own progress"
on public.dictation_progress
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.dictation_progress from public, anon, authenticated;
grant select on table public.dictation_progress to authenticated, service_role;

drop policy if exists "Users can insert own attempts" on public.dictation_attempts;
revoke all on table public.dictation_attempts from public, anon, authenticated;
grant select on table public.dictation_attempts to authenticated, service_role;

create or replace function public.fn_submit_dictation_answer(
  p_user_id uuid,
  p_exercise_id uuid,
  p_sentence_id uuid,
  p_user_input text,
  p_time_spent integer default 0,
  p_replay_count smallint default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  caller_role text := coalesce(auth.role(), current_user::text);
  target_user_id uuid;
  v_correct_text text;
  v_total_sentences integer;
  v_correct_words text[];
  v_user_words text[];
  v_correct_count integer := 0;
  v_total_words integer := 0;
  v_user_word_count integer := 0;
  v_accuracy numeric(5, 2);
  v_attempt_id uuid;
  v_completed_sentences integer := 0;
  v_clamped_time integer;
  v_clamped_replay smallint;
  v_normalized_input text;
begin
  if caller_role = 'service_role' then
    if p_user_id is null then
      raise exception using errcode = '42501', message = 'target user id is required';
    end if;
    target_user_id := p_user_id;
  else
    if actor_id is null then
      raise exception using errcode = '42501', message = 'authentication required';
    end if;
    if p_user_id is not null and p_user_id is distinct from actor_id then
      raise exception using errcode = '42501', message = 'unauthorized user context';
    end if;
    target_user_id := actor_id;
  end if;

  if p_exercise_id is null or p_sentence_id is null or p_user_input is null then
    raise exception using errcode = '22023', message = 'invalid dictation submission input';
  end if;

  select ds.text, de.total_sentences
  into v_correct_text, v_total_sentences
  from public.dictation_sentences as ds
  join public.dictation_exercises as de on de.id = ds.exercise_id
  where ds.id = p_sentence_id
    and ds.exercise_id = p_exercise_id
    and de.is_published = true;

  if v_correct_text is null then
    return jsonb_build_object('error', 'Sentence not found');
  end if;

  v_correct_text := pg_catalog.lower(pg_catalog.btrim(pg_catalog.regexp_replace(
    pg_catalog.regexp_replace(v_correct_text, '[^\w\s'']', '', 'g'),
    '\s+', ' ', 'g'
  )));
  v_normalized_input := pg_catalog.lower(pg_catalog.btrim(pg_catalog.regexp_replace(
    pg_catalog.regexp_replace(pg_catalog.left(p_user_input, 4000), '[^\w\s'']', '', 'g'),
    '\s+', ' ', 'g'
  )));

  v_correct_words := case
    when v_correct_text = '' then '{}'::text[]
    else pg_catalog.string_to_array(v_correct_text, ' ')
  end;
  v_user_words := case
    when v_normalized_input = '' then '{}'::text[]
    else pg_catalog.string_to_array(v_normalized_input, ' ')
  end;

  v_total_words := coalesce(pg_catalog.array_length(v_correct_words, 1), 0);
  v_user_word_count := coalesce(pg_catalog.array_length(v_user_words, 1), 0);

  if v_total_words > 0 and v_user_word_count > 0 then
    for v_i in 1..least(v_user_word_count, v_total_words) loop
      if v_user_words[v_i] = v_correct_words[v_i] then
        v_correct_count := v_correct_count + 1;
      end if;
    end loop;
  end if;

  v_accuracy := case
    when v_total_words > 0 then pg_catalog.round((v_correct_count::numeric / v_total_words) * 100, 2)
    else 0
  end;

  v_clamped_time := least(greatest(coalesce(p_time_spent, 0), 0), 7200);
  v_clamped_replay := least(greatest(coalesce(p_replay_count, 0), 0), 100)::smallint;

  insert into public.dictation_attempts (
    user_id,
    exercise_id,
    sentence_id,
    user_input,
    accuracy_score,
    correct_words,
    total_words,
    time_spent_seconds,
    replay_count
  ) values (
    target_user_id,
    p_exercise_id,
    p_sentence_id,
    v_normalized_input,
    v_accuracy,
    v_correct_count,
    v_total_words,
    v_clamped_time,
    v_clamped_replay
  ) returning id into v_attempt_id;

  select count(distinct da.sentence_id)::integer
  into v_completed_sentences
  from public.dictation_attempts as da
  where da.user_id = target_user_id
    and da.exercise_id = p_exercise_id
    and da.accuracy_score >= 80;

  insert into public.dictation_progress (
    user_id,
    exercise_id,
    best_score,
    latest_score,
    attempts_count,
    completed_sentences,
    total_sentences,
    completed,
    last_attempted_at
  ) values (
    target_user_id,
    p_exercise_id,
    v_accuracy,
    v_accuracy,
    1,
    v_completed_sentences,
    v_total_sentences,
    (v_total_sentences > 0 and v_completed_sentences >= v_total_sentences),
    now()
  )
  on conflict (user_id, exercise_id) do update set
    best_score = greatest(public.dictation_progress.best_score, excluded.best_score),
    latest_score = excluded.latest_score,
    attempts_count = public.dictation_progress.attempts_count + 1,
    completed_sentences = v_completed_sentences,
    total_sentences = v_total_sentences,
    completed = (v_total_sentences > 0 and v_completed_sentences >= v_total_sentences),
    last_attempted_at = now();

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'accuracy_score', v_accuracy,
    'correct_words', v_correct_count,
    'total_words', v_total_words,
    'correct_text', v_correct_text,
    'user_input_normalized', v_normalized_input
  );
end;
$$;

create or replace function public.fn_get_user_dictation_stats(p_user_id uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  caller_role text := coalesce(auth.role(), current_user::text);
  target_user_id uuid;
  v_result jsonb;
begin
  if caller_role = 'service_role' then
    if p_user_id is null then
      raise exception using errcode = '42501', message = 'target user id is required';
    end if;
    target_user_id := p_user_id;
  else
    if actor_id is null then
      raise exception using errcode = '42501', message = 'authentication required';
    end if;
    if p_user_id is not null and p_user_id is distinct from actor_id then
      raise exception using errcode = '42501', message = 'unauthorized user context';
    end if;
    target_user_id := actor_id;
  end if;

  select jsonb_build_object(
    'total_exercises_attempted', count(distinct dp.exercise_id),
    'total_exercises_completed', count(distinct dp.exercise_id) filter (where dp.completed = true),
    'average_best_score', pg_catalog.round(coalesce(avg(dp.best_score), 0), 2),
    'total_attempts', coalesce(sum(dp.attempts_count), 0),
    'last_practiced', max(dp.last_attempted_at)
  ) into v_result
  from public.dictation_progress as dp
  where dp.user_id = target_user_id;

  return coalesce(v_result, jsonb_build_object(
    'total_exercises_attempted', 0,
    'total_exercises_completed', 0,
    'average_best_score', 0,
    'total_attempts', 0,
    'last_practiced', null
  ));
end;
$$;

revoke all on function public.fn_submit_dictation_answer(uuid, uuid, uuid, text, integer, smallint) from public, anon;
grant execute on function public.fn_submit_dictation_answer(uuid, uuid, uuid, text, integer, smallint) to authenticated, service_role;

revoke all on function public.fn_get_user_dictation_stats(uuid) from public, anon;
grant execute on function public.fn_get_user_dictation_stats(uuid) to authenticated, service_role;

-- ============================================================================
-- 4. (P1-01) Legal Policy Consent Audit Table + RPC (NĐ 13/2023/NĐ-CP)
-- ============================================================================
create table if not exists public.user_policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  channel text not null default 'oauth',
  accepted_at timestamptz not null default now(),
  constraint user_policy_acceptances_terms_check check (
    pg_catalog.btrim(terms_version) <> '' and pg_catalog.char_length(terms_version) <= 40
  ),
  constraint user_policy_acceptances_privacy_check check (
    pg_catalog.btrim(privacy_version) <> '' and pg_catalog.char_length(privacy_version) <= 40
  ),
  constraint user_policy_acceptances_channel_check check (
    channel in ('email_signup', 'oauth', 'onboarding_banner', 'profile_review')
  ),
  constraint user_policy_acceptances_unique unique (user_id, terms_version, privacy_version)
);

create index if not exists user_policy_acceptances_user_idx
on public.user_policy_acceptances (user_id, accepted_at desc);

alter table public.user_policy_acceptances enable row level security;
revoke all on table public.user_policy_acceptances from public, anon, authenticated;
grant select on table public.user_policy_acceptances to authenticated, service_role;

drop policy if exists "Users can read own policy acceptances" on public.user_policy_acceptances;
create policy "Users can read own policy acceptances"
on public.user_policy_acceptances
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function public.accept_current_policies(
  p_terms_version text,
  p_privacy_version text,
  p_channel text default 'oauth'
)
returns public.user_policy_acceptances
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  v_row public.user_policy_acceptances;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if p_terms_version is null or pg_catalog.btrim(p_terms_version) = ''
    or p_privacy_version is null or pg_catalog.btrim(p_privacy_version) = '' then
    raise exception using errcode = '22023', message = 'policy versions are required';
  end if;
  if p_channel is null or p_channel not in ('email_signup', 'oauth', 'onboarding_banner', 'profile_review') then
    raise exception using errcode = '22023', message = 'invalid consent channel';
  end if;

  insert into public.user_policy_acceptances (
    user_id,
    terms_version,
    privacy_version,
    channel,
    accepted_at
  ) values (
    actor_id,
    pg_catalog.btrim(p_terms_version),
    pg_catalog.btrim(p_privacy_version),
    p_channel,
    now()
  )
  on conflict (user_id, terms_version, privacy_version) do update
  set accepted_at = public.user_policy_acceptances.accepted_at
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.accept_current_policies(text, text, text) from public, anon;
grant execute on function public.accept_current_policies(text, text, text) to authenticated;

commit;
