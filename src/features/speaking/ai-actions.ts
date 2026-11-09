"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  requestSpeakingAiSchema,
  type RequestSpeakingAiInput,
} from "@/features/speaking/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import {
  checksumTranscriptBundle,
  classifySpeakingAiError,
  generateSpeakingFeedback,
  getSpeakingAiConfiguration,
  transcribeSpeakingAudio,
} from "@/features/speaking/server/ai-review";
import { createSpeakingSignature } from "@/features/speaking/server/audio-verification";
import { downloadSpeakingAudioBlob } from "@/features/speaking/server/storage";

export async function requestSpeakingAiReviewAction(
  input: RequestSpeakingAiInput,
) {
  const parsed = requestSpeakingAiSchema.safeParse(input);
  if (!parsed.success)
    return {
      status: "error" as const,
      message: "Cần đồng ý rõ ràng trước khi gửi audio tới nhà cung cấp.",
    };
  const config = getSpeakingAiConfiguration();
  if (!config) {
    return {
      status: "unavailable" as const,
      message:
        "STT/AI chưa được cấu hình. Bài và audio đã nộp vẫn được lưu an toàn; hệ thống không tạo transcript hay feedback giả.",
    };
  }
  const { account } = await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { data: attempt, error: attemptError } = await supabase
    .from("speaking_attempts")
    .select("id, speaking_set_version_id, status")
    .eq("id", parsed.data.attemptId)
    .eq("status", "submitted")
    .maybeSingle();
  if (attemptError || !attempt)
    return {
      status: "error" as const,
      message: "Không tìm thấy bài Speaking đã nộp của bạn.",
    };
  const [responsesResult, versionResult] = await Promise.all([
    supabase
      .from("speaking_responses")
      .select("id, prompt_id, audio_asset_id")
      .eq("attempt_id", attempt.id)
      .order("created_at"),
    supabase
      .from("speaking_set_versions")
      .select("title")
      .eq("id", attempt.speaking_set_version_id)
      .maybeSingle(),
  ]);
  if (
    responsesResult.error ||
    versionResult.error ||
    !versionResult.data ||
    responsesResult.data.length === 0
  ) {
    return {
      status: "error" as const,
      message: "Dữ liệu bài nộp chưa đầy đủ.",
    };
  }

  const responseIds = responsesResult.data.map((response) => response.id);
  const assetIds = responsesResult.data.flatMap((response) =>
    response.audio_asset_id ? [response.audio_asset_id] : [],
  );
  const [existingTranscriptsResult, audioAssetsResult] = await Promise.all([
    supabase
      .from("speaking_transcripts")
      .select("id, response_id")
      .in("response_id", responseIds),
    supabase
      .from("speaking_audio_assets")
      .select("id, bucket_id, storage_path, mime_type")
      .in("id", assetIds)
      .eq("status", "ready"),
  ]);
  if (existingTranscriptsResult.error || audioAssetsResult.error) {
    return {
      status: "error" as const,
      message: "Dữ liệu bài nộp chưa đầy đủ.",
    };
  }
  const transcribedResponseIds = new Set(
    existingTranscriptsResult.data.map((transcript) => transcript.response_id),
  );
  const audioAssetsById = new Map(
    audioAssetsResult.data.map((asset) => [asset.id, asset]),
  );

  for (const response of responsesResult.data) {
    if (transcribedResponseIds.has(response.id)) continue;
    const asset = response.audio_asset_id
      ? audioAssetsById.get(response.audio_asset_id)
      : undefined;
    if (!asset)
      return {
        status: "error" as const,
        message: "Audio đã xác minh không còn sẵn sàng.",
      };
    const { data: started, error: startError } = await supabase.rpc(
      "start_speaking_transcript_request",
      {
        p_response_id: response.id,
        p_idempotency_key: randomUUID(),
        p_consent_version: "speaking-ai-v1",
        p_provider: "openai",
        p_model: config.transcriptionModel,
      },
    );
    const runId =
      typeof started === "object" && started && "runId" in started
        ? String(started.runId)
        : null;
    if (startError || !runId) {
      const quotaReached = startError?.message?.toLowerCase().includes("quota");
      return {
        status: "error" as const,
        message: quotaReached
          ? "Bạn đã hết lượt chuyển ngữ AI Speaking trong tuần. Nâng cấp Pro để mở rộng hạn mức."
          : "Không thể bắt đầu tạo transcript. Hãy thử lại sau.",
      };
    }
    try {
      const audio = await downloadSpeakingAudioBlob(
        supabase,
        asset.bucket_id,
        asset.storage_path,
        asset.mime_type,
      );
      if (!audio) throw new Error("audio_unavailable");
      const transcript = await transcribeSpeakingAudio({
        config,
        blob: audio,
        mimeType: asset.mime_type,
      });
      const expiresAt = signatureExpiry();
      const signature = createSpeakingSignature(config.signingSecret, [
        "speaking-transcript-v1",
        account.user.id,
        runId,
        createHash("sha256").update(transcript.text).digest("hex"),
        transcript.languageCode,
        Math.floor(expiresAt.getTime() / 1000),
      ]);
      const { error } = await supabase.rpc("finalize_speaking_transcript", {
        p_run_id: runId,
        p_transcript_text: transcript.text,
        p_language_code: transcript.languageCode,
        p_signature_expires_at: expiresAt.toISOString(),
        p_signature: signature,
      });
      if (error) throw error;
    } catch (error) {
      await failTranscript(
        supabase,
        config.signingSecret,
        account.user.id,
        runId,
        classifySpeakingAiError(error),
      );
      return {
        status: "error" as const,
        message:
          "Nhà cung cấp chưa trả transcript hợp lệ. Hệ thống không tạo transcript giả; bạn có thể thử lại sau.",
      };
    }
  }

  const { data: transcriptRows, error: transcriptError } = await supabase
    .from("speaking_transcripts")
    .select("response_id, transcript_text")
    .in(
      "response_id",
      responsesResult.data.map((item) => item.id),
    );
  if (
    transcriptError ||
    transcriptRows.length !== responsesResult.data.length
  ) {
    return {
      status: "error" as const,
      message: "Transcript chưa sẵn sàng cho mọi câu trả lời.",
    };
  }
  const checksum = checksumTranscriptBundle(
    transcriptRows.map((item) => ({
      responseId: item.response_id,
      transcript: item.transcript_text,
    })),
  );
  const { data: feedbackRun, error: feedbackStartError } = await supabase.rpc(
    "start_speaking_feedback_request",
    {
      p_attempt_id: attempt.id,
      p_idempotency_key: randomUUID(),
      p_consent_version: "speaking-ai-v1",
      p_provider: "openai",
      p_model: config.feedbackModel,
      p_transcript_bundle_checksum: checksum,
    },
  );
  if (feedbackStartError || !feedbackRun) {
    const quotaReached = feedbackStartError?.message
      ?.toLowerCase()
      .includes("quota");
    return {
      status: "error" as const,
      message: quotaReached
        ? "Bạn đã hết lượt nhận xét AI Speaking trong tuần (Free: 5 lượt/tuần, Pro: 50 lượt/tuần)."
        : "Chưa thể bắt đầu tạo feedback.",
    };
  }
  try {
    const promptIds = responsesResult.data.map((item) => item.prompt_id);
    const { data: prompts, error: promptsError } = await supabase
      .from("speaking_prompts")
      .select("id, part, prompt_text, display_order")
      .in("id", promptIds)
      .order("display_order");
    if (promptsError) throw promptsError;
    const transcriptMap = new Map(
      transcriptRows.map((item) => [item.response_id, item.transcript_text]),
    );
    const responseByPrompt = new Map(
      responsesResult.data.map((item) => [item.prompt_id, item]),
    );
    const providerFeedback = await generateSpeakingFeedback({
      config,
      setTitle: versionResult.data.title,
      responses: prompts.map((prompt) => ({
        part: prompt.part,
        prompt: prompt.prompt_text,
        transcript:
          transcriptMap.get(responseByPrompt.get(prompt.id)?.id ?? "") ?? "",
      })),
    });
    const payload = JSON.stringify(providerFeedback);
    const expiresAt = signatureExpiry();
    const signature = createSpeakingSignature(config.signingSecret, [
      "speaking-feedback-v1",
      account.user.id,
      feedbackRun.id,
      createHash("sha256").update(payload).digest("hex"),
      Math.floor(expiresAt.getTime() / 1000),
    ]);
    const { error } = await supabase.rpc("finalize_speaking_feedback", {
      p_run_id: feedbackRun.id,
      p_payload: payload,
      p_signature_expires_at: expiresAt.toISOString(),
      p_signature: signature,
    });
    if (error) throw error;
    revalidatePath(
      `/practice/speaking/${parsed.data.setSlug}/attempt/${attempt.id}`,
    );
    return {
      status: "ready" as const,
      message:
        "Feedback luyện tập đã sẵn sàng; đây không phải điểm IELTS chính thức.",
    };
  } catch (error) {
    const code = classifySpeakingAiError(error);
    await failFeedback(
      supabase,
      config.signingSecret,
      account.user.id,
      feedbackRun.id,
      code,
    );
    return {
      status: "error" as const,
      message:
        "Nhà cung cấp chưa trả feedback hợp lệ. Hệ thống không tạo feedback giả; bài nộp không bị ảnh hưởng.",
    };
  }
}

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

async function failTranscript(
  client: SupabaseServerClient,
  secret: string,
  userId: string,
  runId: string,
  code: string,
) {
  const expiresAt = signatureExpiry();
  const signature = createSpeakingSignature(secret, [
    "speaking-transcript-failure-v1",
    userId,
    runId,
    code,
    Math.floor(expiresAt.getTime() / 1000),
  ]);
  await client.rpc("fail_speaking_transcript_run", {
    p_run_id: runId,
    p_error_code: code,
    p_signature_expires_at: expiresAt.toISOString(),
    p_signature: signature,
  });
}

async function failFeedback(
  client: SupabaseServerClient,
  secret: string,
  userId: string,
  runId: string,
  code: string,
) {
  const expiresAt = signatureExpiry();
  const signature = createSpeakingSignature(secret, [
    "speaking-feedback-failure-v1",
    userId,
    runId,
    code,
    Math.floor(expiresAt.getTime() / 1000),
  ]);
  await client.rpc("fail_speaking_feedback_run", {
    p_run_id: runId,
    p_error_code: code,
    p_signature_expires_at: expiresAt.toISOString(),
    p_signature: signature,
  });
}

function signatureExpiry() {
  return new Date((Math.floor(Date.now() / 1000) + 120) * 1000);
}
