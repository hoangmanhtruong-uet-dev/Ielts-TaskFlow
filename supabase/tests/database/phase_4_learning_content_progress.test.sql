begin;

create extension if not exists pgtap with schema extensions;

select extensions.no_plan();

select extensions.has_table('public', 'learning_modules', 'learning_modules exists');
select extensions.has_table('public', 'lessons', 'lessons exists');
select extensions.has_table('public', 'lesson_versions', 'lesson_versions exists');
select extensions.has_table('public', 'lesson_sections', 'lesson_sections exists');
select extensions.has_table(
  'public',
  'learner_lesson_progress',
  'learner_lesson_progress exists'
);
select extensions.has_table(
  'public',
  'learner_section_progress',
  'learner_section_progress exists'
);

select extensions.col_is_pk('public', 'learning_modules', 'id', 'module id is PK');
select extensions.col_is_fk(
  'public',
  'lessons',
  'module_id',
  'lesson references module'
);
select extensions.col_is_fk(
  'public',
  'lesson_versions',
  'lesson_id',
  'lesson version references lesson'
);
select extensions.col_is_fk(
  'public',
  'lesson_sections',
  'lesson_version_id',
  'lesson section references version'
);
select extensions.col_is_fk(
  'public',
  'learner_lesson_progress',
  'user_id',
  'lesson progress references profile'
);
select extensions.ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.learner_section_progress'::regclass
      and conname = 'learner_section_progress_section_fkey'
      and contype = 'f'
  ),
  'section progress has the composite section relationship foreign key'
);

select extensions.ok(
  (
    select bool_and(relrowsecurity)
    from pg_catalog.pg_class
    where oid in (
      'public.learning_modules'::regclass,
      'public.lessons'::regclass,
      'public.lesson_versions'::regclass,
      'public.lesson_sections'::regclass,
      'public.learner_lesson_progress'::regclass,
      'public.learner_section_progress'::regclass
    )
  ),
  'RLS is enabled on every Phase 4 table'
);

select extensions.policies_are(
  'public',
  'learning_modules',
  array['Learners can read accessible learning modules'],
  'modules expose only accessible-read policy'
);
select extensions.policies_are(
  'public',
  'lessons',
  array['Learners can read accessible lessons'],
  'lessons expose only accessible-read policy'
);
select extensions.policies_are(
  'public',
  'lesson_versions',
  array['Learners can read accessible lesson versions'],
  'lesson versions expose only accessible-read policy'
);
select extensions.policies_are(
  'public',
  'lesson_sections',
  array['Learners can read accessible lesson sections'],
  'sections expose only accessible-read policy'
);
select extensions.policies_are(
  'public',
  'learner_lesson_progress',
  array['Learners can read their own lesson progress'],
  'lesson progress exposes only own-read policy'
);
select extensions.policies_are(
  'public',
  'learner_section_progress',
  array['Learners can read their own section progress'],
  'section progress exposes only own-read policy'
);

select extensions.has_trigger(
  'public',
  'learning_modules',
  'set_learning_modules_updated_at',
  'module updated_at trigger exists'
);
select extensions.has_trigger(
  'public',
  'lesson_versions',
  'protect_published_lesson_versions',
  'published lesson version immutability trigger exists'
);
select extensions.has_trigger(
  'public',
  'lesson_sections',
  'protect_published_lesson_sections',
  'published section immutability trigger exists'
);
select extensions.has_trigger(
  'public',
  'lesson_versions',
  'validate_lesson_version_before_publish',
  'publication validation trigger exists'
);
select extensions.has_trigger(
  'public',
  'learner_lesson_progress',
  'set_learner_lesson_progress_updated_at',
  'lesson progress updated_at trigger exists'
);
select extensions.has_trigger(
  'public',
  'learner_section_progress',
  'set_learner_section_progress_updated_at',
  'section progress updated_at trigger exists'
);

select extensions.is_definer(
  'public',
  'open_lesson_section',
  array['uuid', 'uuid'],
  'open lesson RPC is security definer'
);
select extensions.is_definer(
  'public',
  'complete_lesson_section',
  array['uuid', 'uuid'],
  'complete section RPC is security definer'
);

select extensions.ok(
  has_table_privilege('authenticated', 'public.learning_modules', 'select')
  and has_table_privilege('authenticated', 'public.lessons', 'select')
  and has_table_privilege('authenticated', 'public.lesson_versions', 'select')
  and has_table_privilege('authenticated', 'public.lesson_sections', 'select')
  and not has_table_privilege('authenticated', 'public.learning_modules', 'insert')
  and not has_table_privilege('authenticated', 'public.learning_modules', 'update')
  and not has_table_privilege('authenticated', 'public.learning_modules', 'delete'),
  'authenticated has read-only content grants'
);
select extensions.ok(
  not has_table_privilege('anon', 'public.learning_modules', 'select')
  and not has_table_privilege('anon', 'public.lessons', 'select')
  and not has_table_privilege('anon', 'public.lesson_versions', 'select')
  and not has_table_privilege('anon', 'public.lesson_sections', 'select'),
  'anonymous has no content grants'
);
select extensions.ok(
  has_table_privilege(
    'authenticated',
    'public.learner_lesson_progress',
    'select'
  )
  and has_table_privilege(
    'authenticated',
    'public.learner_section_progress',
    'select'
  )
  and not has_table_privilege(
    'authenticated',
    'public.learner_lesson_progress',
    'insert'
  )
  and not has_table_privilege(
    'authenticated',
    'public.learner_lesson_progress',
    'update'
  ),
  'authenticated reads progress but cannot write tables directly'
);
select extensions.ok(
  not has_table_privilege('anon', 'public.learner_lesson_progress', 'select')
  and not has_table_privilege('anon', 'public.learner_section_progress', 'select'),
  'anonymous has no progress grants'
);
select extensions.ok(
  has_function_privilege(
    'authenticated',
    'public.open_lesson_section(uuid,uuid)',
    'execute'
  )
  and has_function_privilege(
    'authenticated',
    'public.complete_lesson_section(uuid,uuid)',
    'execute'
  )
  and not has_function_privilege(
    'anon',
    'public.open_lesson_section(uuid,uuid)',
    'execute'
  ),
  'only authenticated can execute progress RPCs'
);

select extensions.results_eq(
  $$select count(*)::integer from public.learning_modules where status = 'published'$$,
  array[6],
  'seed and curriculum contain six published modules'
);
select extensions.results_eq(
  $$select count(*)::integer from public.lesson_versions where status = 'published'$$,
  array[24],
  'seed and curriculum contain twenty-four published lessons'
);
select extensions.results_eq(
  $$select count(*)::integer from public.lesson_versions where status = 'draft'$$,
  array[1],
  'seed contains one draft lesson fixture'
);
select extensions.results_eq(
  $$
    select count(*)::integer
    from public.lesson_sections
    join public.lesson_versions
      on lesson_versions.id = lesson_sections.lesson_version_id
    where lesson_versions.status = 'published'
  $$,
  array[72],
  'published lessons contain seventy-two sections'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '51111111-1111-4111-8111-111111111111',
    'phase4-user-a@example.test',
    '{"display_name":"Phase 4 Learner A"}'::jsonb
  ),
  (
    '52222222-2222-4222-8222-222222222222',
    'phase4-user-b@example.test',
    '{"display_name":"Phase 4 Learner B"}'::jsonb
  );

insert into public.learner_profiles (
  user_id,
  test_type,
  current_band,
  target_band,
  daily_study_minutes,
  study_days_per_week,
  priority_skills,
  primary_goal,
  onboarding_step,
  onboarding_completed_at
) values
  (
    '51111111-1111-4111-8111-111111111111',
    'academic',
    5.0,
    7.0,
    45,
    5,
    array['reading']::text[],
    'study_abroad',
    8,
    now()
  ),
  (
    '52222222-2222-4222-8222-222222222222',
    'general_training',
    5.0,
    6.5,
    30,
    4,
    array['writing']::text[],
    'work',
    8,
    now()
  );

set local role authenticated;
set local request.jwt.claim.sub = '51111111-1111-4111-8111-111111111111';

select extensions.results_eq(
  $$select count(*)::integer from public.learning_modules$$,
  array[6],
  'Academic learner can read all six published modules'
);
select extensions.results_eq(
  $$select count(*)::integer from public.lessons$$,
  array[24],
  'Academic learner can read twenty-four published lessons'
);
select extensions.results_eq(
  $$
    select count(*)::integer
    from public.lessons
    where slug = 'ghi-chu-khi-doc'
  $$,
  array[0],
  'Draft lesson identity is hidden from learner'
);
select extensions.results_eq(
  $$select count(*)::integer from public.lesson_sections$$,
  array[72],
  'Learner reads sections only from published lesson versions'
);

select extensions.throws_ok(
  $$
    insert into public.learning_modules (
      slug, title, description, skill, test_type, difficulty,
      display_order, status, estimated_minutes
    ) values (
      'forbidden-module', 'Forbidden', 'Forbidden learner write',
      'foundations', 'both', 'beginner', 99, 'draft', 10
    )
  $$,
  '42501',
  'permission denied for table learning_modules',
  'Learner cannot insert content'
);
select extensions.throws_ok(
  $$
    update public.learning_modules
    set title = 'Forbidden update'
    where id = '10000000-0000-4000-8000-000000000001'::uuid
  $$,
  '42501',
  'permission denied for table learning_modules',
  'Learner cannot update content'
);
select extensions.throws_ok(
  $$
    delete from public.learning_modules
    where id = '10000000-0000-4000-8000-000000000001'::uuid
  $$,
  '42501',
  'permission denied for table learning_modules',
  'Learner cannot delete content'
);

select extensions.results_eq(
  $$
    select (public.open_lesson_section(
      '20000000-0000-4000-8000-000000000002'::uuid,
      '40000000-0000-4000-8000-000000000004'::uuid
    )).status
  $$,
  array['in_progress'::text],
  'Opening a lesson creates in-progress state'
);
select extensions.results_eq(
  $$
    select current_section_id
    from public.learner_lesson_progress
    where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
  $$,
  array['40000000-0000-4000-8000-000000000004'::uuid],
  'Opening a section stores the resume position'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_lesson_progress$$,
  array[1],
  'Learner reads their own progress row'
);

select extensions.results_eq(
  $$
    select (public.complete_lesson_section(
      '20000000-0000-4000-8000-000000000002'::uuid,
      '40000000-0000-4000-8000-000000000006'::uuid
    )).progress_percent
  $$,
  array[0.00::numeric],
  'Optional section does not increase required-section percentage'
);
select extensions.results_eq(
  $$
    select (public.complete_lesson_section(
      '20000000-0000-4000-8000-000000000002'::uuid,
      '40000000-0000-4000-8000-000000000004'::uuid
    )).progress_percent
  $$,
  array[50.00::numeric],
  'One of two required sections produces fifty percent progress'
);
select extensions.throws_ok(
  $$
    select public.complete_lesson_section(
      '20000000-0000-4000-8000-000000000002'::uuid,
      '40000000-0000-4000-8000-000000000001'::uuid
    )
  $$,
  '23503',
  'section does not belong to lesson',
  'RPC rejects a section from another lesson'
);
select extensions.results_eq(
  $$
    select (public.complete_lesson_section(
      '20000000-0000-4000-8000-000000000002'::uuid,
      '40000000-0000-4000-8000-000000000005'::uuid
    )).status
  $$,
  array['completed'::text],
  'All required sections complete the lesson'
);
select extensions.results_eq(
  $$
    select progress_percent
    from public.learner_lesson_progress
    where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
  $$,
  array[100.00::numeric],
  'Completed lesson is exactly one hundred percent'
);
select extensions.ok(
  (
    select completed_at is not null
    from public.learner_lesson_progress
    where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
  ),
  'Completion timestamp is database controlled'
);
select extensions.results_eq(
  $$
    with before_retry as (
      select completed_at
      from public.learner_lesson_progress
      where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
    ), retry as (
      select (public.complete_lesson_section(
        '20000000-0000-4000-8000-000000000002'::uuid,
        '40000000-0000-4000-8000-000000000005'::uuid
      )).completed_at
    )
    select retry.completed_at = before_retry.completed_at
    from before_retry, retry
  $$,
  array[true],
  'Completion is idempotent and preserves completed_at'
);
select extensions.results_eq(
  $$
    select count(*)::integer
    from public.learner_section_progress
    where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
  $$,
  array[3],
  'Section evidence is unique and not duplicated by retry'
);
select extensions.throws_ok(
  $$
    update public.learner_lesson_progress
    set progress_percent = 42
    where lesson_id = '20000000-0000-4000-8000-000000000002'::uuid
  $$,
  '42501',
  'permission denied for table learner_lesson_progress',
  'Learner cannot mass-assign calculated progress'
);
select extensions.throws_ok(
  $$
    select public.open_lesson_section(
      '20000000-0000-4000-8000-000000000005'::uuid,
      '40000000-0000-4000-8000-000000000013'::uuid
    )
  $$,
  'P0002',
  'lesson not found',
  'Draft lesson cannot be opened through RPC'
);

set local request.jwt.claim.sub = '52222222-2222-4222-8222-222222222222';

select extensions.results_eq(
  $$select count(*)::integer from public.learning_modules$$,
  array[2],
  'General Training learner sees only the both modules'
);
select extensions.results_eq(
  $$select count(*)::integer from public.lessons$$,
  array[7],
  'General Training learner sees only foundation lessons'
);
select extensions.results_eq(
  $$select count(*)::integer from public.learner_lesson_progress$$,
  array[0],
  'User B cannot read User A progress'
);
select extensions.throws_ok(
  $$
    update public.learner_lesson_progress
    set last_accessed_at = now()
    where user_id = '51111111-1111-4111-8111-111111111111'::uuid
  $$,
  '42501',
  'permission denied for table learner_lesson_progress',
  'User B cannot update User A progress'
);
select extensions.throws_ok(
  $$
    select public.open_lesson_section(
      '20000000-0000-4000-8000-000000000003'::uuid,
      '40000000-0000-4000-8000-000000000007'::uuid
    )
  $$,
  'P0002',
  'lesson not found',
  'General Training learner cannot start Academic-only lesson'
);

reset role;

select extensions.throws_ok(
  $$
    update public.lesson_versions
    set title = 'Mutated published title'
    where id = '30000000-0000-4000-8000-000000000001'::uuid
  $$,
  '55000',
  'published lesson versions are immutable',
  'Published lesson version cannot be edited'
);
select extensions.throws_ok(
  $$
    insert into public.lesson_sections (
      lesson_version_id,
      section_type,
      body_markdown,
      display_order
    ) values (
      '30000000-0000-4000-8000-000000000001'::uuid,
      'text',
      'Late section',
      99
    )
  $$,
  '55000',
  'sections of published lesson versions are immutable',
  'Published lesson cannot receive a late section'
);
select extensions.throws_ok(
  $$
    insert into public.learner_lesson_progress (
      user_id,
      lesson_id,
      lesson_version_id,
      progress_percent
    ) values (
      '52222222-2222-4222-8222-222222222222'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000001'::uuid,
      101
    )
  $$,
  '23514',
  null,
  'Database rejects progress above one hundred percent'
);

set local role anon;
select extensions.throws_ok(
  'select count(*) from public.learning_modules',
  '42501',
  'permission denied for table learning_modules',
  'Anonymous cannot read learning content'
);
select extensions.throws_ok(
  $$
    select public.open_lesson_section(
      '20000000-0000-4000-8000-000000000001'::uuid,
      '40000000-0000-4000-8000-000000000001'::uuid
    )
  $$,
  '42501',
  'permission denied for function open_lesson_section',
  'Anonymous cannot execute progress RPC'
);

reset role;

select * from extensions.finish();
rollback;
