-- Forward migration: Remove unintended permissive SELECT policy added on public.lessons
-- by 20261015000000_learning_and_practice_core.sql so Phase 4's scoped
-- "Learners can read accessible lessons" policy enforces draft & test_type isolation.

begin;

drop policy if exists "Public read lessons" on public.lessons;

commit;
