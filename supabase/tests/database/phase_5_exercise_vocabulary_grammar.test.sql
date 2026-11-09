begin;

create extension if not exists pgtap with schema extensions;
select extensions.no_plan();

select extensions.has_table('public', 'exercise_sets', 'exercise_sets exists');
select extensions.has_table('public', 'exercise_set_versions', 'exercise_set_versions exists');
select extensions.has_table('public', 'exercise_questions', 'exercise_questions exists');
select extensions.has_table('public', 'exercise_options', 'exercise_options exists');
select extensions.has_table('public', 'learner_attempts', 'learner_attempts exists');
select extensions.has_table('public', 'learner_answers', 'learner_answers exists');
select extensions.has_table('public', 'learner_answer_options', 'learner_answer_options exists');
select extensions.has_table('public', 'vocabulary_entries', 'vocabulary_entries exists');
select extensions.has_table('public', 'vocabulary_entry_versions', 'vocabulary_entry_versions exists');
select extensions.has_table('public', 'grammar_topics', 'grammar_topics exists');
select extensions.has_table('public', 'grammar_topic_versions', 'grammar_topic_versions exists');
select extensions.has_table('private', 'exercise_answer_keys', 'private answer keys exist');
select extensions.has_table('private', 'exercise_correct_options', 'private correct options exist');
select extensions.has_table('private', 'exercise_correct_text_answers', 'private text answers exist');

select extensions.ok(
  (select bool_and(relrowsecurity) from pg_catalog.pg_class where oid in (
    'public.exercise_sets'::regclass,
    'public.exercise_set_versions'::regclass,
    'public.exercise_questions'::regclass,
    'public.exercise_options'::regclass,
    'public.vocabulary_entries'::regclass,
    'public.vocabulary_entry_versions'::regclass,
    'public.grammar_topics'::regclass,
    'public.grammar_topic_versions'::regclass,
    'public.learner_attempts'::regclass,
    'public.learner_answers'::regclass,
    'public.learner_answer_options'::regclass
  )),
  'RLS is enabled on all public Phase 5 tables'
);

select extensions.policies_are(
  'public', 'learner_attempts', array['Learners can read their own attempts'],
  'attempts expose only owner-read policy'
);
select extensions.policies_are(
  'public', 'learner_answers', array['Learners can read their own answers'],
  'answers expose only owner-read policy'
);
select extensions.policies_are(
  'public', 'exercise_questions', array['Learners can read accessible exercise questions'],
  'questions expose only accessible published content'
);
select extensions.is_definer(
  'public', 'start_exercise_attempt', array['text', 'text'],
  'start attempt RPC is security definer'
);
select extensions.is_definer(
  'public', 'save_exercise_answer', array['uuid', 'uuid', 'uuid[]', 'text', 'integer'],
  'save answer RPC is security definer'
);
select extensions.is_definer(
  'public', 'submit_exercise_attempt', array['uuid'],
  'submit attempt RPC is security definer'
);
select extensions.is_definer(
  'public', 'get_exercise_attempt_result', array['uuid'],
  'result RPC is security definer'
);

select extensions.ok(
  has_table_privilege('authenticated', 'public.exercise_questions', 'select')
  and not has_table_privilege('authenticated', 'public.exercise_questions', 'insert')
  and not has_table_privilege('authenticated', 'public.exercise_questions', 'update')
  and not has_table_privilege('authenticated', 'public.exercise_questions', 'delete'),
  'authenticated has read-only exercise content grants'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'private.exercise_answer_keys', 'select')
  and not has_table_privilege('authenticated', 'private.exercise_correct_options', 'select')
  and not has_table_privilege('authenticated', 'private.exercise_correct_text_answers', 'select'),
  'learners have no answer-key table grants'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.learner_attempts', 'insert')
  and not has_table_privilege('authenticated', 'public.learner_attempts', 'update')
  and not has_table_privilege('authenticated', 'public.learner_answers', 'insert')
  and not has_table_privilege('authenticated', 'public.learner_answers', 'update'),
  'attempt and answer mutations are RPC-only'
);
select extensions.ok(
  not has_table_privilege('anon', 'public.exercise_sets', 'select')
  and not has_table_privilege('anon', 'public.learner_attempts', 'select'),
  'anonymous has no Phase 5 table grants'
);

select extensions.results_eq(
  $$select count(*)::integer
    from public.exercise_set_versions as versions
    join public.exercise_sets as sets on sets.id = versions.exercise_set_id
    where versions.status = 'published' and sets.domain in ('vocabulary', 'grammar')$$,
  array[22],
  'seed and curriculum have twenty-two published exercise sets'
);
select extensions.results_eq(
  $$select count(*)::integer
    from public.exercise_set_versions as versions
    join public.exercise_sets as sets on sets.id = versions.exercise_set_id
    where versions.status = 'draft' and sets.domain in ('vocabulary', 'grammar')$$,
  array[1],
  'seed has one draft exercise fixture'
);
select extensions.results_eq(
  $$select count(*)::integer
    from public.exercise_questions as questions
    join public.exercise_set_versions as versions on versions.id = questions.exercise_set_version_id
    join public.exercise_sets as sets on sets.id = versions.exercise_set_id
    where sets.domain in ('vocabulary', 'grammar')$$,
  array[128],
  'seed and curriculum have 128 exercise questions'
);
select extensions.results_eq(
  $$select count(*)::integer from public.vocabulary_entry_versions where status = 'published'$$,
  array[328],
  'seed and curriculum have 328 published vocabulary entries'
);
select extensions.results_eq(
  $$select count(*)::integer from public.grammar_topic_versions where status = 'published'$$,
  array[13],
  'seed and curriculum have 13 published grammar topics'
);

select extensions.throws_ok(
  $$update public.exercise_set_versions set title = 'Changed' where id = '31000000-0000-4000-8000-000000000001'::uuid$$,
  '55000', 'published exercise versions are immutable',
  'published exercise version cannot be edited'
);
select extensions.throws_ok(
  $$update public.vocabulary_entry_versions set term = 'changed' where id = '41000000-0000-4000-8000-000000000001'::uuid$$,
  '55000', 'published learning content is immutable',
  'published vocabulary cannot be edited'
);

insert into public.exercise_sets (id, slug, domain, display_order)
values ('39999999-9999-4999-8999-999999999999', 'invalid-empty-set', 'grammar', 1000);
insert into public.exercise_set_versions (
  id, exercise_set_id, version, title, summary, instructions_markdown, difficulty
) values (
  '31999999-9999-4999-8999-999999999999',
  '39999999-9999-4999-8999-999999999999',
  1, 'Invalid', 'Invalid publication fixture', 'No questions', 'beginner'
);
select extensions.throws_ok(
  $$update public.exercise_set_versions set status = 'published', published_at = now() where id = '31999999-9999-4999-8999-999999999999'::uuid$$,
  '23514', 'a published exercise requires at least one question',
  'publication rejects an exercise without questions'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('61111111-1111-4111-8111-111111111111', 'phase5-user-a@example.test', '{"display_name":"Phase 5 Learner A"}'::jsonb),
  ('62222222-2222-4222-8222-222222222222', 'phase5-user-b@example.test', '{"display_name":"Phase 5 Learner B"}'::jsonb);

insert into public.learner_profiles (
  user_id, test_type, current_band, target_band, daily_study_minutes,
  study_days_per_week, priority_skills, primary_goal, onboarding_step,
  onboarding_completed_at
) values
  ('61111111-1111-4111-8111-111111111111', 'academic', 5.0, 7.0, 45, 5, array['reading']::text[], 'study_abroad', 8, now()),
  ('62222222-2222-4222-8222-222222222222', 'academic', 5.5, 7.0, 30, 4, array['writing']::text[], 'work', 8, now());

set local role authenticated;
set local request.jwt.claim.sub = '61111111-1111-4111-8111-111111111111';

select extensions.results_eq(
  $$select count(*)::integer from public.exercise_sets where domain in ('vocabulary', 'grammar')$$,
  array[22],
  'learner sees only published exercise identities'
);
select extensions.results_eq(
  $$select count(*)::integer from public.exercise_set_versions where status = 'draft'$$,
  array[0],
  'draft exercise version is hidden'
);
select extensions.results_eq(
  $$select count(*)::integer from public.vocabulary_entries$$,
  array[328],
  'learner sees published vocabulary'
);
select extensions.results_eq(
  $$select count(*)::integer from public.grammar_topics$$,
  array[13],
  'learner sees published grammar'
);
select extensions.throws_ok(
  'select count(*) from private.exercise_answer_keys',
  '42501', 'permission denied for table exercise_answer_keys',
  'learner cannot select hidden answer keys'
);

select extensions.lives_ok(
  $$select public.start_exercise_attempt('academic-vocabulary-foundations', 'phase5-a-vocab-1')$$,
  'learner can start a published exercise'
);
select extensions.lives_ok(
  $$select public.start_exercise_attempt('academic-vocabulary-foundations', 'phase5-a-vocab-1')$$,
  'start is idempotent for the same key'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'$$,
  array[1],
  'idempotent start creates one attempt'
);

select extensions.throws_ok(
  $$select public.get_exercise_attempt_result((select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'))$$,
  '55000', 'result is not available before submit',
  'answer key cannot be released before submit'
);
select extensions.throws_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000001'::uuid,
    array['33000000-0000-4000-8000-000000000018'::uuid], null, 1
  )$$,
  '22023', 'invalid selected option',
  'answer RPC rejects an option from another question'
);
select extensions.throws_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000001'::uuid,
    array['33000000-0000-4000-8000-000000000001'::uuid, '33000000-0000-4000-8000-000000000001'::uuid], null, 1
  )$$,
  '22023', 'duplicate selected option',
  'answer RPC rejects duplicate options'
);

select extensions.lives_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000001'::uuid,
    array['33000000-0000-4000-8000-000000000001'::uuid], null, 1
  )$$,
  'single-choice answer saves'
);
select extensions.lives_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000002'::uuid,
    array['33000000-0000-4000-8000-000000000005'::uuid, '33000000-0000-4000-8000-000000000004'::uuid], null, 1
  )$$,
  'multiple-choice answer saves independent of option order'
);
select extensions.lives_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000003'::uuid,
    array['33000000-0000-4000-8000-000000000009'::uuid], null, 1
  )$$,
  'true-false answer saves'
);
select extensions.lives_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000004'::uuid,
    '{}'::uuid[], '  MITIGATE  ', 1
  )$$,
  'short-text answer saves'
);
select extensions.lives_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000004'::uuid,
    '{}'::uuid[], '  MITIGATE  ', 1
  )$$,
  'identical answer revision replays safely'
);
select extensions.throws_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000004'::uuid,
    '{}'::uuid[], 'evaluate', 1
  )$$,
  '40001', 'stale or conflicting answer revision',
  'same revision with different payload is rejected'
);

select extensions.lives_ok(
  $$select public.submit_exercise_attempt((select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'))$$,
  'attempt submits and scores'
);
select extensions.results_eq(
  $$select score::integer from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'$$,
  array[4],
  'database scores deterministic answers as four points'
);
select extensions.results_eq(
  $$select max_score::integer from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'$$,
  array[5],
  'database derives max score from published questions'
);
select extensions.lives_ok(
  $$select public.submit_exercise_attempt((select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'))$$,
  'repeated submit returns stored result'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_answers where finalized_at is not null$$,
  array[4],
  'all attempt answers are finalized exactly once'
);
select extensions.throws_ok(
  $$select public.save_exercise_answer(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1'),
    '32000000-0000-4000-8000-000000000001'::uuid,
    array['33000000-0000-4000-8000-000000000002'::uuid], null, 2
  )$$,
  '55000', 'submitted attempt is immutable',
  'submitted answers cannot be changed'
);
select extensions.ok(
  (public.get_exercise_attempt_result(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1')
  ) ->> 'score')::integer = 4,
  'owner result RPC returns stored score'
);
select extensions.ok(
  jsonb_array_length(public.get_exercise_attempt_result(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1')
  ) -> 'questions') = 4,
  'owner result includes four reviewed questions'
);

set local request.jwt.claim.sub = '62222222-2222-4222-8222-222222222222';
select extensions.results_eq(
  $$select count(*)::integer from public.learner_attempts$$,
  array[0],
  'user B cannot read user A attempts'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_answers$$,
  array[0],
  'user B cannot read user A answers'
);
select extensions.throws_ok(
  $$select public.get_exercise_attempt_result(
    (select id from public.learner_attempts where start_idempotency_key = 'phase5-a-vocab-1')
  )$$,
  'P0002', 'attempt not found',
  'user B cannot access user A result'
);

reset role;
set local role anon;
select extensions.throws_ok(
  'select count(*) from public.exercise_sets',
  '42501', 'permission denied for table exercise_sets',
  'anonymous cannot read exercises'
);
select extensions.throws_ok(
  $$select public.start_exercise_attempt('academic-vocabulary-foundations', 'anon-start')$$,
  '42501', 'permission denied for function start_exercise_attempt',
  'anonymous cannot start attempts'
);

reset role;
select * from extensions.finish();
rollback;
