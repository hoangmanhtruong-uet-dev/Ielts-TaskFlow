begin;

create extension if not exists pgtap with schema extensions;
select extensions.no_plan();

-- ============================================================================
-- Schema & privilege hardening assertions (Phase 11 audit remediation)
-- ============================================================================
select extensions.ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.app_roles'::regclass),
  'RLS is enabled on public.app_roles'
);
select extensions.ok(
  (select relrowsecurity from pg_catalog.pg_class where oid = 'public.user_policy_acceptances'::regclass),
  'RLS is enabled on public.user_policy_acceptances'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.app_roles', 'insert')
  and not has_table_privilege('authenticated', 'public.app_roles', 'update')
  and not has_table_privilege('authenticated', 'public.app_roles', 'delete')
  and not has_table_privilege('anon', 'public.app_roles', 'select')
  and not has_table_privilege('anon', 'public.admin_users', 'select'),
  'Roles and admin_users view disallow client mutations and anonymous reads'
);
select extensions.ok(
  not has_function_privilege('authenticated', 'public.award_xp(uuid,integer,text)', 'execute')
  and not has_function_privilege('anon', 'public.award_xp(uuid,integer,text)', 'execute')
  and has_function_privilege('service_role', 'public.award_xp(uuid,integer,text)', 'execute'),
  'award_xp is restricted to service_role only'
);
select extensions.ok(
  has_function_privilege('authenticated', 'public.buy_streak_freeze(integer)', 'execute')
  and not has_function_privilege('anon', 'public.buy_streak_freeze(integer)', 'execute'),
  'buy_streak_freeze is authenticated-only'
);
select extensions.ok(
  not has_table_privilege('authenticated', 'public.exercise_attempts', 'update')
  and not has_table_privilege('authenticated', 'public.exercise_attempts', 'delete')
  and not has_table_privilege('authenticated', 'public.dictation_progress', 'update')
  and not has_table_privilege('authenticated', 'public.dictation_progress', 'insert')
  and not has_table_privilege('authenticated', 'public.dictation_attempts', 'insert'),
  'Client roles cannot tamper directly with exercise_attempts, dictation_progress, or dictation_attempts'
);
select extensions.ok(
  pg_catalog.to_regprocedure('public.finalize_r2_speaking_upload(uuid,uuid,text,text,bigint,numeric,text)') is not null
  and pg_catalog.to_regprocedure('public.finalize_r2_speaking_upload(uuid,uuid,text,text,bigint,numeric)') is null
  and pg_catalog.to_regprocedure('public.get_learner_ai_quota_usage()') is not null
  and pg_catalog.to_regprocedure('public.save_exercise_draft_json(uuid,jsonb)') is not null
  and pg_catalog.to_regprocedure('public.accept_current_policies(text,text,text)') is not null,
  'Hardened RPC signatures exist and insecure overloads are removed'
);

-- ============================================================================
-- Seed fixtures for multi-actor verification
-- ============================================================================
insert into auth.users (id, email, raw_user_meta_data) values
  ('d1111111-1111-4111-8111-111111111111', 'audit-student-a@example.test', '{"display_name":"Audit Student A"}'::jsonb),
  ('d2222222-2222-4222-8222-222222222222', 'audit-student-b@example.test', '{"display_name":"Audit Student B"}'::jsonb),
  ('d3333333-3333-4333-8333-333333333333', 'audit-admin@example.test', '{"display_name":"Audit Admin"}'::jsonb);

insert into public.app_roles (user_id, role) values
  ('d1111111-1111-4111-8111-111111111111', 'student'),
  ('d3333333-3333-4333-8333-333333333333', 'super_admin');

insert into public.learner_profiles (
  user_id, test_type, current_band, target_band, daily_study_minutes,
  study_days_per_week, priority_skills, primary_goal, onboarding_step, onboarding_completed_at
) values
  ('d1111111-1111-4111-8111-111111111111', 'academic', 5.0, 7.0, 30, 5, array['reading']::text[], 'study_abroad', 8, now()),
  ('d2222222-2222-4222-8222-222222222222', 'academic', 5.5, 7.0, 30, 5, array['listening']::text[], 'work', 8, now());

-- Grant Student A 550 XP as service_role
select public.award_xp('d1111111-1111-4111-8111-111111111111', 500, 'mock_test_completed');
select public.award_xp('d1111111-1111-4111-8111-111111111111', 50, 'lesson_completed');

-- Seed Pro subscription for Student B
insert into public.subscriptions (user_id, tier, status, current_period_end)
values ('d2222222-2222-4222-8222-222222222222', 'pro', 'active', now() + interval '30 days');

-- Seed unpublished dictation exercise for probe check + published dictation exercise
insert into public.dictation_exercises (id, title, difficulty, audio_url, total_sentences, is_published) values
  ('d9999999-9999-4999-8999-999999999991', 'Unpublished Secret Dictation', 2, 'https://example.test/secret.mp3', 1, false),
  ('d9999999-9999-4999-8999-999999999992', 'Published Audit Dictation', 2, 'https://example.test/public.mp3', 1, true);
insert into public.dictation_sentences (id, exercise_id, order_index, text, start_time, end_time) values
  ('d8888888-8888-4888-8888-888888888881', 'd9999999-9999-4999-8999-999999999991', 1, 'Hidden answer', 0, 5),
  ('d8888888-8888-4888-8888-888888888882', 'd9999999-9999-4999-8999-999999999992', 1, 'Public test phrase', 0, 5);

-- ============================================================================
-- Test Student A behavior
-- ============================================================================
set local role authenticated;
set local request.jwt.claim.sub = 'd1111111-1111-4111-8111-111111111111';

-- RBAC isolation: Student A sees 0 rows in admin_users and only own student role
select extensions.results_eq(
  $$select count(*)::integer from public.admin_users$$,
  array[0],
  'Student A cannot enumerate admin_users via security_invoker view'
);
select extensions.results_eq(
  $$select count(*)::integer from public.app_roles$$,
  array[1],
  'Student A reads only own app_roles row'
);

-- Gamification: buy_streak_freeze succeeds cleanly and deducts XP atomically
select extensions.lives_ok(
  $$select public.buy_streak_freeze(500)$$,
  'Student A redeems streak freeze atomically with sufficient XP'
);
select extensions.results_eq(
  $$select total_xp, streak_freezes_available from public.user_gamification where user_id = 'd1111111-1111-4111-8111-111111111111'$$,
  $$values (50, 1)$$,
  'XP deducted to 50 and 1 freeze granted'
);
select extensions.throws_ok(
  $$select public.buy_streak_freeze(500)$$,
  'P0001',
  'insufficient xp balance for streak freeze',
  'Second streak freeze rejects when XP balance is insufficient'
);
select extensions.throws_ok(
  $$select public.buy_streak_freeze(1)$$,
  '22023',
  'invalid streak freeze cost',
  'Client cannot forge discounted streak freeze price'
);

-- Dictation hardening: cannot submit for Student B or probe unpublished sentence, empty answer works safely
select extensions.throws_ok(
  $$select public.fn_submit_dictation_answer('d2222222-2222-4222-8222-222222222222', 'd9999999-9999-4999-8999-999999999992', 'd8888888-8888-4888-8888-888888888882', 'Public test phrase', 10, 0::smallint)$$,
  '42501',
  'unauthorized user context',
  'Student A cannot submit dictation answer on behalf of Student B'
);
select extensions.results_eq(
  $$select (public.fn_submit_dictation_answer(null, 'd9999999-9999-4999-8999-999999999991', 'd8888888-8888-4888-8888-888888888881', 'probe', 10, 0::smallint)) ->> 'error'$$,
  array['Sentence not found'::text],
  'Unpublished dictation sentence cannot be probed'
);
select extensions.results_eq(
  $$select (public.fn_submit_dictation_answer(null, 'd9999999-9999-4999-8999-999999999992', 'd8888888-8888-4888-8888-888888888882', '   ', 5, 0::smallint) ->> 'accuracy_score')::numeric$$,
  array[0::numeric],
  'Blank dictation submission safely evaluates to 0 percent without array_length null error'
);

-- Policy acceptance RPC
select extensions.lives_ok(
  $$select public.accept_current_policies('2026-11', '2026-11', 'oauth')$$,
  'Learner can record policy acceptance idempotently'
);
select extensions.results_eq(
  $$select count(*)::integer from public.user_policy_acceptances$$,
  array[1],
  'Policy acceptance record stored for current user'
);

-- AI Quota RPC for free user
select extensions.results_eq(
  $$select (public.get_learner_ai_quota_usage() ->> 'weeklyLimitPerSkill')::integer$$,
  array[5],
  'Free tier exposes 5 weekly AI reviews per skill'
);

-- Reading check_exercise_answer for TFNG & Matching Headings + Mock Test Isolation
select extensions.lives_ok(
  $$select public.start_exercise_attempt('academic-reading-cool-roofs', 'audit-tfng-check')$$,
  'Student A starts Reading practice attempt'
);
select extensions.lives_ok(
  $$select public.save_exercise_answer((select id from public.learner_attempts where start_idempotency_key = 'audit-tfng-check'), '66000000-0000-4000-8000-000000000203', array['66000000-0000-4000-8000-000000000310'::uuid], null, 1)$$,
  'Saves TFNG answer'
);
select extensions.results_eq(
  $$select (public.check_exercise_answer((select id from public.learner_attempts where start_idempotency_key = 'audit-tfng-check'), '66000000-0000-4000-8000-000000000203') ->> 'isCorrect')::boolean$$,
  array[true],
  'check_exercise_answer evaluates true_false_not_given option IDs accurately'
);

-- Mock isolation: active practice attempt does NOT block or collide with starting Mock Reading section
select extensions.lives_ok(
  $$select public.start_mock_test('academic-foundation-mock', 'audit-mock-start')$$,
  'Student A starts mock test while holding an active practice attempt'
);
select extensions.lives_ok(
  $$select public.start_mock_test_section((select id from public.mock_test_sessions limit 1), 'a1200000-0000-4000-8000-000000000001', 'audit-mock-reading-start')$$,
  'Mock test creates an isolated is_mock=true attempt alongside active practice attempt'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_attempts where user_id = 'd1111111-1111-4111-8111-111111111111' and status = 'in_progress'$$,
  array[2],
  'Practice and Mock Reading attempts remain isolated simultaneously'
);

-- Speaking R2 finalize rejects bad key prefix and fake zero hash
select extensions.lives_ok(
  $$select public.start_speaking_attempt('everyday-choices', 'audit-spk-start')$$,
  'Student A starts speaking attempt'
);
select extensions.throws_ok(
  $$select public.finalize_r2_speaking_upload((select id from public.speaking_attempts limit 1), '91200000-0000-4000-8000-000000000001', 'speaking/wrong-prefix.webm', 'audio/webm', 1024, 10, repeat('a', 64))$$,
  '42501',
  'Invalid or unauthorized R2 storage key',
  'finalize_r2_speaking_upload rejects storage keys outside actor/attempt prefix'
);
select extensions.throws_ok(
  format($$select public.finalize_r2_speaking_upload(%L::uuid, '91200000-0000-4000-8000-000000000001', %L, 'audio/webm', 1024, 10, repeat('0', 64))$$,
    (select id from public.speaking_attempts limit 1),
    'd1111111-1111-4111-8111-111111111111/speaking/' || (select id from public.speaking_attempts limit 1) || '/test.webm'
  ),
  '22023',
  'Valid sha256 checksum is required',
  'finalize_r2_speaking_upload rejects zero placeholder checksum'
);

-- ============================================================================
-- Test Student B (Pro subscription quota) + Super Admin view + Speaking R2 cleanup lifecycle
-- ============================================================================
set local request.jwt.claim.sub = 'd2222222-2222-4222-8222-222222222222';
select extensions.results_eq(
  $$select (public.get_learner_ai_quota_usage() ->> 'weeklyLimitPerSkill')::integer$$,
  array[50],
  'Active Pro subscription raises weekly AI quota limit to 50'
);

set local request.jwt.claim.sub = 'd3333333-3333-4333-8333-333333333333';
select extensions.results_eq(
  $$select count(*)::integer from public.admin_users$$,
  array[1],
  'Super admin sees own record in security_invoker admin_users view'
);

-- Service role tests R2 cleanup lifecycle transition without trigger error
reset role;
insert into public.speaking_responses (id, user_id, attempt_id, speaking_set_version_id, prompt_id)
values (
  'd5555555-5555-4555-8555-555555555551',
  'd1111111-1111-4111-8111-111111111111',
  (select id from public.speaking_attempts limit 1),
  '91100000-0000-4000-8000-000000000001',
  '91200000-0000-4000-8000-000000000001'
);
insert into public.speaking_audio_assets (
  id, user_id, attempt_id, response_id, bucket_id, storage_path,
  mime_type, size_bytes, duration_seconds, sha256_checksum, status, retention_until
) values (
  'd6666666-6666-4666-8666-666666666661',
  'd1111111-1111-4111-8111-111111111111',
  (select id from public.speaking_attempts limit 1),
  'd5555555-5555-4555-8555-555555555551',
  'cloudflare-r2',
  'd1111111-1111-4111-8111-111111111111/speaking/cleanup/sample.webm',
  'audio/webm',
  2048,
  12,
  repeat('c', 64),
  'orphaned',
  now() + interval '1 day'
);
select extensions.results_eq(
  $$select bucket_id from public.claim_speaking_audio_cleanup(10) where id = 'd6666666-6666-4666-8666-666666666661'$$,
  array['cloudflare-r2'::text],
  'claim_speaking_audio_cleanup returns bucket_id and transitions orphaned -> cleanup_pending'
);
select extensions.lives_ok(
  $$update public.speaking_audio_assets set status = 'deleted', deleted_at = now(), cleanup_started_at = null where id = 'd6666666-6666-4666-8666-666666666661'$$,
  'protect_speaking_audio_asset permits cleanup_pending -> deleted completion update'
);

-- Verify user_lesson_progress -> learner_lesson_progress sync trigger
insert into public.user_lesson_progress (user_id, lesson_id, status, completion_percentage, completed_at)
values ('d1111111-1111-4111-8111-111111111111', '20000000-0000-4000-c000-000000000001', 'completed', 95, now());
select extensions.results_eq(
  $$select status, progress_percent from public.learner_lesson_progress where user_id = 'd1111111-1111-4111-8111-111111111111' and lesson_id = '20000000-0000-4000-c000-000000000001'$$,
  $$values ('completed'::text, 100.00::numeric)$$,
  'user_lesson_progress sync trigger updates learner_lesson_progress with valid normalized percentage'
);

-- ============================================================================
-- Deferrable FK + Account Deletion Cascade Hardening (Auth user erasure)
-- ============================================================================
select extensions.ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_responses'::regclass
      and conname = 'speaking_responses_audio_asset_fkey'
      and contype = 'f'
      and condeferrable = true
      and condeferred = true
      and confdeltype = 'a'
  ),
  'speaking_responses_audio_asset_fkey uses deferrable ON DELETE NO ACTION'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('d4444444-4444-4444-8444-444444444444', 'audit-cascade@example.test', '{"display_name":"Audit Cascade"}'::jsonb);

insert into public.learner_profiles (
  user_id, test_type, current_band, target_band, daily_study_minutes,
  study_days_per_week, priority_skills, primary_goal, onboarding_step, onboarding_completed_at
) values (
  'd4444444-4444-4444-8444-444444444444', 'academic', 5.5, 7.0, 30, 5, array['writing','speaking']::text[], 'work', 8, now()
);

insert into public.subscriptions (user_id, tier, status, current_period_end)
values ('d4444444-4444-4444-8444-444444444444', 'pro', 'active', now() + interval '30 days');

insert into public.user_policy_acceptances (user_id, terms_version, privacy_version, channel)
values ('d4444444-4444-4444-8444-444444444444', '2026-11', '2026-11', 'oauth');

select public.award_xp('d4444444-4444-4444-8444-444444444444', 200, 'lesson_completed');

insert into public.user_lesson_progress (user_id, lesson_id, status, completion_percentage, completed_at)
values ('d4444444-4444-4444-8444-444444444444', '20000000-0000-4000-c000-000000000001', 'completed', 100, now());

insert into public.writing_submissions (
  id, user_id, writing_task_id, writing_task_version_id, is_mock, status,
  draft_text, submitted_text, server_revision, word_count, minimum_words_met,
  start_idempotency_key, submit_idempotency_key, content_checksum,
  started_at, last_saved_at, expires_at, submitted_at, submitted_after_time_limit
) values (
  'd7777777-7777-4777-8777-777777777701',
  'd4444444-4444-4444-8444-444444444444',
  '81000000-0000-4000-8000-000000000001',
  '82000000-0000-4000-8000-000000000001',
  true,
  'submitted',
  'Sample essay for cascade erasure verification across learner data.',
  'Sample essay for cascade erasure verification across learner data.',
  1,
  9,
  false,
  'cascade-w-start',
  'cascade-w-submit',
  repeat('e', 64),
  now() - interval '10 minutes',
  now() - interval '5 minutes',
  now() + interval '30 minutes',
  now(),
  false
);

insert into public.writing_feedback_runs (
  id, user_id, submission_id, status, request_idempotency_key, request_hash,
  provider, model_label, input_checksum, consent_version, attempt_number,
  requested_at, lease_expires_at, completed_at, error_code
) values (
  'd7777777-7777-4777-8777-777777777702',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777701',
  'ready',
  'cascade-wf-req',
  repeat('f', 64),
  'openai',
  'gpt-4o-mini',
  repeat('e', 64),
  'writing-ai-v1',
  1,
  now() - interval '1 minute',
  now() + interval '1 minute',
  now(),
  null
);

insert into public.writing_feedback (
  id, run_id, submission_id, user_id, overall_band_estimate, task_response_band,
  coherence_cohesion_band, lexical_resource_band, grammatical_range_accuracy_band,
  confidence, summary, criteria, strengths, priority_issues, revision_plan, corrected_examples
) values (
  'd7777777-7777-4777-8777-777777777703',
  'd7777777-7777-4777-8777-777777777702',
  'd7777777-7777-4777-8777-777777777701',
  'd4444444-4444-4444-8444-444444444444',
  6.5, 6.5, 6.5, 6.5, 6.5,
  'medium',
  'Cascade verification writing summary.',
  '{}'::jsonb,
  '["Clear thesis"]'::jsonb,
  '["Issue 1","Issue 2","Issue 3"]'::jsonb,
  '["Plan 1","Plan 2","Plan 3"]'::jsonb,
  '[]'::jsonb
);

insert into public.speaking_attempts (
  id, user_id, speaking_set_id, speaking_set_version_id, is_mock, status, start_idempotency_key
) values (
  'd7777777-7777-4777-8777-777777777710',
  'd4444444-4444-4444-8444-444444444444',
  '91000000-0000-4000-8000-000000000001',
  '91100000-0000-4000-8000-000000000001',
  true,
  'in_progress',
  'cascade-s-start'
);

insert into public.speaking_responses (
  id, user_id, attempt_id, speaking_set_version_id, prompt_id
) values (
  'd7777777-7777-4777-8777-777777777711',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777710',
  '91100000-0000-4000-8000-000000000001',
  '91200000-0000-4000-8000-000000000001'
);

insert into public.speaking_audio_assets (
  id, user_id, attempt_id, response_id, bucket_id, storage_path,
  mime_type, size_bytes, duration_seconds, sha256_checksum, status, retention_until
) values
  (
    'd7777777-7777-4777-8777-777777777712',
    'd4444444-4444-4444-8444-444444444444',
    'd7777777-7777-4777-8777-777777777710',
    'd7777777-7777-4777-8777-777777777711',
    'cloudflare-r2',
    'd4444444-4444-4444-8444-444444444444/speaking/d7777777-7777-4777-8777-777777777710/ready.webm',
    'audio/webm',
    2048,
    12,
    repeat('d', 64),
    'ready',
    now() + interval '30 days'
  ),
  (
    'd7777777-7777-4777-8777-777777777713',
    'd4444444-4444-4444-8444-444444444444',
    'd7777777-7777-4777-8777-777777777710',
    'd7777777-7777-4777-8777-777777777711',
    'cloudflare-r2',
    'd4444444-4444-4444-8444-444444444444/speaking/d7777777-7777-4777-8777-777777777710/orphaned.webm',
    'audio/webm',
    1024,
    10,
    repeat('b', 64),
    'orphaned',
    now() + interval '30 days'
  );

update public.speaking_responses
set audio_asset_id = 'd7777777-7777-4777-8777-777777777712', submitted_at = now()
where id = 'd7777777-7777-4777-8777-777777777711';

update public.speaking_attempts
set status = 'submitted', submit_idempotency_key = 'cascade-s-submit', submitted_at = now()
where id = 'd7777777-7777-4777-8777-777777777710';

insert into public.speaking_transcript_runs (
  id, user_id, response_id, status, provider, model, request_idempotency_key,
  audio_checksum, consent_version, attempt_number, requested_at, lease_expires_at, completed_at, error_code
) values (
  'd7777777-7777-4777-8777-777777777714',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777711',
  'ready',
  'openai',
  'whisper-1',
  'cascade-st-req',
  repeat('d', 64),
  'speaking-ai-v1',
  1,
  now() - interval '1 minute',
  now() + interval '1 minute',
  now(),
  null
);

insert into public.speaking_transcripts (
  id, run_id, user_id, response_id, transcript_text, language_code
) values (
  'd7777777-7777-4777-8777-777777777715',
  'd7777777-7777-4777-8777-777777777714',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777711',
  'Cascade verification speaking transcript.',
  'en'
);

insert into public.speaking_feedback_runs (
  id, user_id, attempt_id, status, provider, model, request_idempotency_key,
  transcript_bundle_checksum, rubric_version, prompt_version, consent_version,
  attempt_number, requested_at, lease_expires_at, completed_at, error_code
) values (
  'd7777777-7777-4777-8777-777777777716',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777710',
  'ready',
  'openai',
  'gpt-4o-mini',
  'cascade-sf-req',
  repeat('d', 64),
  'speaking-practice-v1',
  'speaking-feedback-v1',
  'speaking-ai-v1',
  1,
  now() - interval '1 minute',
  now() + interval '1 minute',
  now(),
  null
);

insert into public.speaking_feedback (
  id, run_id, user_id, attempt_id, estimated_overall_band, estimated_fluency_band,
  estimated_lexical_band, estimated_grammar_band, estimated_pronunciation_band,
  pronunciation_scope, confidence, summary, criteria, strengths, suggestions, disclaimer
) values (
  'd7777777-7777-4777-8777-777777777717',
  'd7777777-7777-4777-8777-777777777716',
  'd4444444-4444-4444-8444-444444444444',
  'd7777777-7777-4777-8777-777777777710',
  6.0, 6.0, 6.0, 6.0, null,
  'transcript_only',
  'medium',
  'Cascade verification speaking summary.',
  '{}'::jsonb,
  '["Clear example"]'::jsonb,
  '["Extend point"]'::jsonb,
  'AI practice feedback only - not an official IELTS score.'
);

insert into public.mock_test_sessions (
  id, user_id, mock_test_id, mock_test_version_id, status, current_section_order,
  start_idempotency_key, submit_idempotency_key, started_at, submitted_at, completed_at
) values (
  'd7777777-7777-4777-8777-777777777720',
  'd4444444-4444-4444-8444-444444444444',
  'a1000000-0000-4000-8000-000000000001',
  'a1100000-0000-4000-8000-000000000001',
  'completed',
  null,
  'cascade-m-start',
  'cascade-m-submit',
  now() - interval '1 hour',
  now() - interval '5 minutes',
  now()
);

insert into public.mock_test_results (
  id, session_id, user_id, mock_test_version_id, writing_submission_id, speaking_attempt_id
) values (
  'd7777777-7777-4777-8777-777777777721',
  'd7777777-7777-4777-8777-777777777720',
  'd4444444-4444-4444-8444-444444444444',
  'a1100000-0000-4000-8000-000000000001',
  'd7777777-7777-4777-8777-777777777701',
  'd7777777-7777-4777-8777-777777777710'
);

-- Client role still cannot directly delete immutable records
set local role authenticated;
set local request.jwt.claim.sub = 'd4444444-4444-4444-8444-444444444444';
select extensions.throws_ok(
  $$delete from public.writing_submissions where id = 'd7777777-7777-4777-8777-777777777701'$$,
  '42501',
  'permission denied for table writing_submissions',
  'Authenticated learners cannot delete writing submissions directly'
);
select extensions.throws_ok(
  $$delete from public.speaking_attempts where id = 'd7777777-7777-4777-8777-777777777710'$$,
  '42501',
  'permission denied for table speaking_attempts',
  'Authenticated learners cannot delete speaking attempts directly'
);
select extensions.throws_ok(
  $$delete from public.speaking_audio_assets where id = 'd7777777-7777-4777-8777-777777777712'$$,
  '42501',
  'permission denied for table speaking_audio_assets',
  'Authenticated learners cannot delete speaking audio assets directly'
);

-- Privileged auth.users erasure cascades cleanly across all learner records
reset role;
select extensions.lives_ok(
  $$delete from auth.users where id = 'd4444444-4444-4444-8444-444444444444'$$,
  'Deleting an Auth user cascades across Writing, Speaking, R2 assets, Mock Tests, Gamification, and Subscriptions without FK/trigger blocks'
);
select extensions.results_eq(
  $$select (
    (select count(*) from public.profiles where id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.writing_submissions where user_id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.speaking_attempts where user_id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.speaking_responses where user_id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.speaking_audio_assets where user_id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.mock_test_sessions where user_id = 'd4444444-4444-4444-8444-444444444444') +
    (select count(*) from public.mock_test_results where user_id = 'd4444444-4444-4444-8444-444444444444')
  )::integer$$,
  array[0],
  'Zero orphaned learner rows remain after Auth user deletion cascade'
);

select * from extensions.finish();
rollback;
