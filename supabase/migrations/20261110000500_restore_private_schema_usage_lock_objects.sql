-- Forward migration: Restore authenticated USAGE on private schema (preserving table-level ACL error semantics
-- and RLS helper accessibility) while explicitly revoking all table, sequence, and internal/secret function privileges.

begin;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;

revoke all on function
  private.exercise_version_status_for_question(uuid),
  private.protect_exercise_answers(),
  private.normalize_exact_answer(text, boolean),
  private.count_writing_words(text),
  private.writing_signing_secret(),
  private.valid_writing_band(numeric),
  private.writing_feedback_evidence_is_valid(jsonb, text),
  private.speaking_signing_secret(),
  private.speaking_upload_signature_message(uuid, uuid, text, bigint, numeric, text, timestamptz),
  private.speaking_upload_expected_signature(uuid, uuid, text, bigint, numeric, text, timestamptz)
from public, anon, authenticated;

commit;
