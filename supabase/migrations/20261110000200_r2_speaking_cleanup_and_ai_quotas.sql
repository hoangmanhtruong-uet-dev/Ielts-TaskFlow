-- Forward migration: Cloudflare R2 upload verification, cleanup lifecycle trigger fix, deferrable speaking FK, and subscription-tiered AI quotas.

begin;

-- ============================================================================
-- 1. (P0-08) Fix protect_speaking_audio_asset trigger & deferrable FK
-- ============================================================================
alter table public.speaking_audio_assets
  drop constraint if exists speaking_audio_assets_bucket_check,
  add constraint speaking_audio_assets_bucket_check check (
    bucket_id in ('speaking-recordings', 'cloudflare-r2')
  ),
  drop constraint if exists speaking_audio_assets_checksum_check,
  add constraint speaking_audio_assets_checksum_check check (
    sha256_checksum ~ '^[0-9a-f]{64}$'
  );

alter table public.speaking_responses
  drop constraint if exists speaking_responses_audio_asset_fkey,
  add constraint speaking_responses_audio_asset_fkey
    foreign key (audio_asset_id)
    references public.speaking_audio_assets (id)
    on delete no action
    deferrable initially deferred;

alter table public.mock_test_section_attempts
  drop constraint if exists mock_test_section_attempts_learner_attempt_id_fkey,
  add constraint mock_test_section_attempts_learner_attempt_id_fkey
    foreign key (learner_attempt_id)
    references public.learner_attempts (id)
    on delete no action
    deferrable initially deferred,
  drop constraint if exists mock_test_section_attempts_writing_submission_id_fkey,
  add constraint mock_test_section_attempts_writing_submission_id_fkey
    foreign key (writing_submission_id)
    references public.writing_submissions (id)
    on delete no action
    deferrable initially deferred,
  drop constraint if exists mock_test_section_attempts_speaking_attempt_id_fkey,
  add constraint mock_test_section_attempts_speaking_attempt_id_fkey
    foreign key (speaking_attempt_id)
    references public.speaking_attempts (id)
    on delete no action
    deferrable initially deferred;

alter table public.mock_test_results
  drop constraint if exists mock_test_results_writing_submission_id_fkey,
  add constraint mock_test_results_writing_submission_id_fkey
    foreign key (writing_submission_id)
    references public.writing_submissions (id)
    on delete no action
    deferrable initially deferred,
  drop constraint if exists mock_test_results_speaking_attempt_id_fkey,
  add constraint mock_test_results_speaking_attempt_id_fkey
    foreign key (speaking_attempt_id)
    references public.speaking_attempts (id)
    on delete no action
    deferrable initially deferred;

create or replace function public.protect_speaking_audio_asset()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  metadata_unchanged boolean;
begin
  if tg_op = 'DELETE' then
    raise exception 'Speaking audio metadata cannot be deleted';
  end if;

  metadata_unchanged :=
    old.user_id is not distinct from new.user_id
    and old.attempt_id is not distinct from new.attempt_id
    and old.response_id is not distinct from new.response_id
    and old.upload_intent_id is not distinct from new.upload_intent_id
    and old.bucket_id is not distinct from new.bucket_id
    and old.storage_path is not distinct from new.storage_path
    and old.mime_type is not distinct from new.mime_type
    and old.size_bytes is not distinct from new.size_bytes
    and old.duration_seconds is not distinct from new.duration_seconds
    and old.sha256_checksum is not distinct from new.sha256_checksum
    and old.retention_until is not distinct from new.retention_until
    and old.created_at is not distinct from new.created_at;

  if old is distinct from new then
    if not metadata_unchanged then
      raise exception 'Verified speaking audio metadata is immutable';
    end if;

    if not (
      (
        old.status = 'ready'
        and new.status = 'orphaned'
        and new.cleanup_started_at is null
        and new.deleted_at is null
      )
      or (
        old.status in ('ready', 'orphaned', 'cleanup_pending')
        and new.status = 'cleanup_pending'
        and new.cleanup_started_at is not null
        and new.deleted_at is null
      )
      or (
        old.status = 'cleanup_pending'
        and new.status = 'deleted'
        and new.cleanup_started_at is null
        and new.deleted_at is not null
      )
    ) then
      raise exception 'Verified speaking audio metadata is immutable';
    end if;
  end if;

  return new;
end;
$$;

-- ============================================================================
-- 2. (P0-08) Hardened finalize_r2_speaking_upload with checksum + prefix + prompt ownership
-- ============================================================================
drop function if exists public.finalize_r2_speaking_upload(uuid, uuid, text, text, bigint, numeric);

create or replace function public.finalize_r2_speaking_upload(
  p_attempt_id uuid,
  p_prompt_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_size_bytes bigint,
  p_duration_seconds numeric,
  p_sha256_checksum text
)
returns public.speaking_audio_assets
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_attempt public.speaking_attempts;
  target_prompt public.speaking_prompts;
  target_response public.speaking_responses;
  result public.speaking_audio_assets;
  old_asset_id uuid;
  expected_prefix text;
  normalized_checksum text;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;
  if p_mime_type is null or p_mime_type not in ('audio/webm', 'audio/mp4', 'audio/mpeg') then
    raise exception using errcode = '22023', message = 'Unsupported audio type';
  end if;
  if p_size_bytes is null or p_size_bytes not between 1 and 15728640 then
    raise exception using errcode = '22023', message = 'Audio size is outside the allowed range';
  end if;
  if p_duration_seconds is null or p_duration_seconds not between 1 and 180 then
    raise exception using errcode = '22023', message = 'Audio duration is outside the allowed range';
  end if;

  normalized_checksum := pg_catalog.lower(coalesce(p_sha256_checksum, ''));
  if normalized_checksum !~ '^[0-9a-f]{64}$' or normalized_checksum = pg_catalog.repeat('0', 64) then
    raise exception using errcode = '22023', message = 'Valid sha256 checksum is required';
  end if;

  expected_prefix := actor_id::text || '/speaking/' || p_attempt_id::text || '/';
  if p_storage_path is null
    or pg_catalog.char_length(p_storage_path) > 500
    or p_storage_path ~ '(^|/)\.\.(/|$)'
    or pg_catalog.left(p_storage_path, pg_catalog.char_length(expected_prefix)) <> expected_prefix then
    raise exception using errcode = '42501', message = 'Invalid or unauthorized R2 storage key';
  end if;

  select sa.* into target_attempt
  from public.speaking_attempts as sa
  where sa.id = p_attempt_id and sa.user_id = actor_id
  for update;
  if not found or target_attempt.status <> 'in_progress' then
    raise exception using errcode = '55000', message = 'Speaking attempt is not editable';
  end if;

  select sp.* into target_prompt
  from public.speaking_prompts as sp
  where sp.id = p_prompt_id
    and sp.speaking_set_version_id = target_attempt.speaking_set_version_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Prompt does not belong to this speaking attempt';
  end if;

  insert into public.speaking_responses (user_id, attempt_id, speaking_set_version_id, prompt_id)
  values (actor_id, target_attempt.id, target_attempt.speaking_set_version_id, target_prompt.id)
  on conflict (attempt_id, prompt_id) do update
  set updated_at = now()
  returning * into target_response;

  old_asset_id := target_response.audio_asset_id;

  insert into public.speaking_audio_assets (
    user_id,
    attempt_id,
    response_id,
    bucket_id,
    storage_path,
    mime_type,
    size_bytes,
    duration_seconds,
    sha256_checksum
  ) values (
    actor_id,
    target_attempt.id,
    target_response.id,
    'cloudflare-r2',
    p_storage_path,
    p_mime_type,
    p_size_bytes,
    p_duration_seconds,
    normalized_checksum
  )
  returning * into result;

  update public.speaking_responses as sr
  set audio_asset_id = result.id, updated_at = now()
  where sr.id = target_response.id
    and sr.user_id = actor_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'speaking prompt response not found for user attempt';
  end if;

  if old_asset_id is not null then
    update public.speaking_audio_assets as saa
    set status = 'orphaned', updated_at = now()
    where saa.id = old_asset_id
      and saa.status = 'ready';
  end if;

  return result;
end;
$$;

revoke all on function public.finalize_r2_speaking_upload(uuid, uuid, text, text, bigint, numeric, text) from public, anon, authenticated;
grant execute on function public.finalize_r2_speaking_upload(uuid, uuid, text, text, bigint, numeric, text) to authenticated;

-- ============================================================================
-- 3. (P0-08) Cleanup claim RPC returning bucket_id + storage_path (keeps (integer) signature)
-- ============================================================================
drop function if exists public.claim_speaking_audio_cleanup(integer);

create function public.claim_speaking_audio_cleanup(p_batch_size integer default 100)
returns table (id uuid, bucket_id text, storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select assets.id
    from public.speaking_audio_assets as assets
    where (
      assets.status = 'orphaned'
      or (assets.status = 'ready' and assets.retention_until <= now())
      or (
        assets.status = 'cleanup_pending'
        and assets.cleanup_started_at <= now() - interval '15 minutes'
      )
    )
    order by assets.retention_until, assets.id
    for update skip locked
    limit least(greatest(coalesce(p_batch_size, 100), 1), 100)
  )
  update public.speaking_audio_assets as assets
  set
    status = 'cleanup_pending',
    cleanup_started_at = now(),
    updated_at = now()
  from candidates
  where assets.id = candidates.id
  returning assets.id, assets.bucket_id, assets.storage_path;
end;
$$;

revoke all on function public.claim_speaking_audio_cleanup(integer) from public, anon, authenticated;
grant execute on function public.claim_speaking_audio_cleanup(integer) to service_role;

-- ============================================================================
-- 4. (P0-09) Subscription-aware AI Feedback Quotas + Learner Usage Overview RPC
-- ============================================================================
create or replace function public.start_writing_feedback_request(
  p_submission_id uuid,
  p_idempotency_key text,
  p_consent_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_submission public.writing_submissions;
  target_version public.writing_task_versions;
  target_run public.writing_feedback_runs;
  attempts_used integer;
  weekly_used integer;
  weekly_limit integer := 5;
  burst_used integer;
  is_pro boolean := false;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;
  if nullif((select private.writing_signing_secret()), '') is null then
    raise exception using errcode = '55000', message = 'writing feedback signing is not configured';
  end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = ''
    or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception using errcode = '22023', message = 'invalid idempotency key';
  end if;
  if p_consent_version <> 'writing-ai-v1' then
    raise exception using errcode = '22023', message = 'writing AI consent is required';
  end if;

  select submissions.* into target_submission
  from public.writing_submissions as submissions
  where submissions.id = p_submission_id and submissions.user_id = actor_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'writing submission not found';
  end if;
  if target_submission.status <> 'submitted' then
    raise exception using errcode = '55000', message = 'feedback requires a submitted writing';
  end if;
  if target_submission.word_count < 50 or target_submission.word_count > 1000 then
    raise exception using errcode = '22023', message = 'writing length is outside feedback limits';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_id::text || ':writing-feedback', 0));

  update public.writing_feedback_runs as runs set
    status = 'failed',
    error_code = 'provider_timeout',
    completed_at = now()
  where runs.submission_id = target_submission.id
    and runs.user_id = actor_id
    and runs.status = 'pending'
    and runs.lease_expires_at <= now();

  select versions.* into target_version
  from public.writing_task_versions as versions
  where versions.id = target_submission.writing_task_version_id;

  select runs.* into target_run
  from public.writing_feedback_runs as runs
  where runs.user_id = actor_id and runs.request_idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'runId', target_run.id,
      'status', target_run.status,
      'shouldCallProvider', false
    );
  end if;

  select runs.* into target_run
  from public.writing_feedback_runs as runs
  where runs.submission_id = target_submission.id and runs.status in ('pending', 'ready')
  order by runs.requested_at desc
  limit 1;
  if found then
    return jsonb_build_object(
      'runId', target_run.id,
      'status', target_run.status,
      'shouldCallProvider', false
    );
  end if;

  select count(*)::integer into attempts_used
  from public.writing_feedback_runs as runs
  where runs.submission_id = target_submission.id;
  if attempts_used >= 2 then
    raise exception using errcode = '22023', message = 'feedback retry limit reached';
  end if;

  select exists (
    select 1
    from public.subscriptions as s
    where s.user_id = actor_id
      and s.tier = 'pro'::public.subscription_tier
      and s.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)
      and (s.current_period_end is null or s.current_period_end > now())
  ) into is_pro;
  weekly_limit := case when is_pro then 50 else 5 end;

  select count(*)::integer into weekly_used
  from public.writing_feedback_runs as runs
  where runs.user_id = actor_id and runs.requested_at >= now() - interval '7 days';
  if weekly_used >= weekly_limit then
    raise exception using errcode = 'P0001', message = 'writing feedback weekly quota reached';
  end if;

  select count(*)::integer into burst_used
  from public.writing_feedback_runs as runs
  where runs.user_id = actor_id and runs.requested_at >= now() - interval '1 minute';
  if burst_used >= 2 then
    raise exception using errcode = 'P0001', message = 'writing feedback rate limit reached';
  end if;

  insert into public.writing_feedback_runs (
    user_id,
    submission_id,
    request_idempotency_key,
    request_hash,
    input_checksum,
    consent_version,
    attempt_number,
    provider_started_at,
    lease_expires_at
  ) values (
    actor_id,
    target_submission.id,
    p_idempotency_key,
    encode(extensions.digest(convert_to(
      target_submission.content_checksum || ':writing-task-2-v1:ielts-writing-task-2-v1',
      'UTF8'
    ), 'sha256'), 'hex'),
    target_submission.content_checksum,
    p_consent_version,
    attempts_used + 1,
    now(),
    now() + interval '30 seconds'
  )
  returning * into target_run;

  return jsonb_build_object(
    'runId', target_run.id,
    'status', target_run.status,
    'shouldCallProvider', true,
    'finalizeNonce', target_run.finalize_nonce,
    'taskType', target_version.task_type,
    'taskTitle', target_version.title,
    'taskPrompt', target_version.prompt_text,
    'instructions', target_version.instructions,
    'minimumWords', target_version.minimum_words,
    'wordTarget', target_version.word_target,
    'essay', target_submission.submitted_text
  );
end;
$$;

create or replace function public.start_speaking_transcript_request(
  p_response_id uuid,
  p_idempotency_key text,
  p_consent_version text,
  p_provider text,
  p_model text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_response public.speaking_responses;
  target_attempt public.speaking_attempts;
  target_asset public.speaking_audio_assets;
  target_run public.speaking_transcript_runs;
  previous_count integer;
  weekly_used integer;
  weekly_limit integer := 20;
  burst_used integer;
  is_pro boolean := false;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if nullif(private.speaking_signing_secret(), '') is null then raise exception 'Speaking AI is not configured'; end if;
  if p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = '' or pg_catalog.char_length(p_idempotency_key) > 200
    or p_consent_version <> 'speaking-ai-v1' then raise exception 'Invalid transcript request'; end if;

  select * into target_response from public.speaking_responses where id = p_response_id and user_id = actor_id;
  if not found or target_response.submitted_at is null then raise exception 'Only submitted responses can be transcribed'; end if;
  select * into target_attempt from public.speaking_attempts where id = target_response.attempt_id and user_id = actor_id;
  if target_attempt.status <> 'submitted' then raise exception 'Only submitted attempts can be transcribed'; end if;
  select * into target_asset from public.speaking_audio_assets where id = target_response.audio_asset_id and status = 'ready';
  if not found then raise exception 'Verified audio is unavailable'; end if;

  select * into target_run from public.speaking_transcript_runs where user_id = actor_id and request_idempotency_key = p_idempotency_key;
  if found then return jsonb_build_object('runId', target_run.id, 'bucketId', target_asset.bucket_id, 'storagePath', target_asset.storage_path); end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_id::text || ':speaking-transcript', 0));

  select count(*) into previous_count from public.speaking_transcript_runs where response_id = target_response.id;
  if previous_count >= 2 then raise exception 'Transcript retry limit reached'; end if;

  select exists (
    select 1
    from public.subscriptions as s
    where s.user_id = actor_id
      and s.tier = 'pro'::public.subscription_tier
      and s.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)
      and (s.current_period_end is null or s.current_period_end > now())
  ) into is_pro;
  weekly_limit := case when is_pro then 200 else 20 end;

  select count(*) into weekly_used from public.speaking_transcript_runs
  where user_id = actor_id and requested_at >= now() - interval '7 days';
  if weekly_used >= weekly_limit then raise exception 'Speaking transcript weekly quota reached'; end if;

  select count(*) into burst_used from public.speaking_transcript_runs
  where user_id = actor_id and requested_at >= now() - interval '1 minute';
  if burst_used >= 5 then raise exception 'Speaking transcript rate limit reached'; end if;

  update public.speaking_transcript_runs set status = 'failed', completed_at = now(), error_code = 'lease_expired'
  where response_id = target_response.id and status = 'pending' and lease_expires_at <= now();
  if exists (select 1 from public.speaking_transcript_runs where response_id = target_response.id and status in ('pending', 'ready')) then
    raise exception 'Transcript already exists or is being prepared';
  end if;

  insert into public.speaking_transcript_runs (
    user_id, response_id, provider, model, request_idempotency_key, audio_checksum,
    consent_version, attempt_number, lease_expires_at
  ) values (
    actor_id, target_response.id, left(p_provider, 80), left(p_model, 120), p_idempotency_key,
    target_asset.sha256_checksum, p_consent_version, previous_count + 1, now() + interval '2 minutes'
  ) returning * into target_run;

  return jsonb_build_object('runId', target_run.id, 'bucketId', target_asset.bucket_id, 'storagePath', target_asset.storage_path);
end;
$$;

create or replace function public.start_speaking_feedback_request(
  p_attempt_id uuid,
  p_idempotency_key text,
  p_consent_version text,
  p_provider text,
  p_model text,
  p_transcript_bundle_checksum text
)
returns public.speaking_feedback_runs
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  target_attempt public.speaking_attempts;
  target_run public.speaking_feedback_runs;
  previous_count integer;
  weekly_used integer;
  weekly_limit integer := 5;
  burst_used integer;
  is_pro boolean := false;
begin
  if actor_id is null then raise exception 'Authentication required'; end if;
  if nullif(private.speaking_signing_secret(), '') is null then raise exception 'Speaking AI is not configured'; end if;
  if p_consent_version <> 'speaking-ai-v1' or p_transcript_bundle_checksum !~ '^[0-9a-f]{64}$'
    or p_idempotency_key is null or pg_catalog.btrim(p_idempotency_key) = '' or pg_catalog.char_length(p_idempotency_key) > 200 then
    raise exception 'Invalid feedback request';
  end if;

  select * into target_attempt from public.speaking_attempts where id = p_attempt_id and user_id = actor_id;
  if not found or target_attempt.status <> 'submitted' then raise exception 'Only submitted attempts can receive feedback'; end if;
  if exists (
    select 1 from public.speaking_responses responses where responses.attempt_id = target_attempt.id
    and not exists (select 1 from public.speaking_transcripts transcripts where transcripts.response_id = responses.id)
  ) then raise exception 'Transcripts are not ready for every response'; end if;

  select * into target_run from public.speaking_feedback_runs where user_id = actor_id and request_idempotency_key = p_idempotency_key;
  if found then return target_run; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_id::text || ':speaking-feedback', 0));

  select count(*) into previous_count from public.speaking_feedback_runs where attempt_id = target_attempt.id;
  if previous_count >= 2 then raise exception 'Feedback retry limit reached'; end if;

  select exists (
    select 1
    from public.subscriptions as s
    where s.user_id = actor_id
      and s.tier = 'pro'::public.subscription_tier
      and s.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)
      and (s.current_period_end is null or s.current_period_end > now())
  ) into is_pro;
  weekly_limit := case when is_pro then 50 else 5 end;

  select count(*) into weekly_used from public.speaking_feedback_runs
  where user_id = actor_id and requested_at >= now() - interval '7 days';
  if weekly_used >= weekly_limit then raise exception 'Speaking feedback weekly quota reached'; end if;

  select count(*) into burst_used from public.speaking_feedback_runs
  where user_id = actor_id and requested_at >= now() - interval '1 minute';
  if burst_used >= 2 then raise exception 'Speaking feedback rate limit reached'; end if;

  update public.speaking_feedback_runs set status = 'failed', completed_at = now(), error_code = 'lease_expired'
  where attempt_id = target_attempt.id and status = 'pending' and lease_expires_at <= now();
  if exists (select 1 from public.speaking_feedback_runs where attempt_id = target_attempt.id and status in ('pending', 'ready')) then
    raise exception 'Feedback already exists or is being prepared';
  end if;

  insert into public.speaking_feedback_runs (
    user_id, attempt_id, provider, model, request_idempotency_key, transcript_bundle_checksum,
    rubric_version, prompt_version, consent_version, attempt_number, lease_expires_at
  ) values (
    actor_id, target_attempt.id, left(p_provider, 80), left(p_model, 120), p_idempotency_key,
    p_transcript_bundle_checksum, 'speaking-practice-v1', 'speaking-feedback-v1', p_consent_version,
    previous_count + 1, now() + interval '2 minutes'
  ) returning * into target_run;

  return target_run;
end;
$$;

revoke all on function public.start_writing_feedback_request(uuid, text, text),
  public.start_speaking_transcript_request(uuid, text, text, text, text),
  public.start_speaking_feedback_request(uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.start_writing_feedback_request(uuid, text, text),
  public.start_speaking_transcript_request(uuid, text, text, text, text),
  public.start_speaking_feedback_request(uuid, text, text, text, text, text) to authenticated;

create or replace function public.get_learner_ai_quota_usage()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  is_pro boolean := false;
  v_weekly_limit integer := 5;
  v_writing_weekly integer := 0;
  v_speaking_weekly integer := 0;
  v_writing_today integer := 0;
  v_speaking_today integer := 0;
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'authentication required';
  end if;

  select exists (
    select 1
    from public.subscriptions as s
    where s.user_id = actor_id
      and s.tier = 'pro'::public.subscription_tier
      and s.status in ('active'::public.subscription_status, 'trialing'::public.subscription_status)
      and (s.current_period_end is null or s.current_period_end > now())
  ) into is_pro;

  v_weekly_limit := case when is_pro then 50 else 5 end;

  select
    count(*) filter (where r.requested_at >= now() - interval '7 days')::integer,
    count(*) filter (where r.requested_at >= now() - interval '1 day')::integer
  into v_writing_weekly, v_writing_today
  from public.writing_feedback_runs as r
  where r.user_id = actor_id;

  select
    count(*) filter (where r.requested_at >= now() - interval '7 days')::integer,
    count(*) filter (where r.requested_at >= now() - interval '1 day')::integer
  into v_speaking_weekly, v_speaking_today
  from public.speaking_feedback_runs as r
  where r.user_id = actor_id;

  return jsonb_build_object(
    'tier', case when is_pro then 'pro' else 'free' end,
    'weeklyLimitPerSkill', v_weekly_limit,
    'writingUsedWeekly', v_writing_weekly,
    'writingUsedToday', v_writing_today,
    'speakingUsedWeekly', v_speaking_weekly,
    'speakingUsedToday', v_speaking_today
  );
end;
$$;

revoke all on function public.get_learner_ai_quota_usage() from public, anon;
grant execute on function public.get_learner_ai_quota_usage() to authenticated;

commit;
