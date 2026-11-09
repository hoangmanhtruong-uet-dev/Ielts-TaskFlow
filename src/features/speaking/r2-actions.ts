"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { verifySpeakingAudioBuffer } from "@/features/speaking/server/audio-verification";
import {
  deleteR2Objects,
  generateUploadUrl,
  getR2ObjectBytes,
  headR2Object,
  putR2Object,
} from "@/lib/r2";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "@/lib/validation/zod";

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

const ALLOWED_AUDIO_MIME_EXTENSIONS = {
  "audio/webm": ".webm",
  "audio/mp4": ".m4a",
  "audio/mpeg": ".mp3",
} as const;

type AllowedSpeakingMime = keyof typeof ALLOWED_AUDIO_MIME_EXTENSIONS;

const uuidSchema = z.string().uuid();

function normalizeAudioMime(rawMimeType: string): AllowedSpeakingMime | null {
  const base = rawMimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (base in ALLOWED_AUDIO_MIME_EXTENSIONS) {
    return base as AllowedSpeakingMime;
  }
  return null;
}

async function assertOwnedAttemptAndPrompt(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  attemptId: string,
  promptId: string,
) {
  const { data: attempt, error: attemptError } = await supabase
    .from("speaking_attempts")
    .select("id, speaking_set_version_id, status")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (attemptError || !attempt) {
    return {
      ok: false as const,
      message: "Phiên luyện Speaking không tồn tại hoặc đã được nộp.",
    };
  }

  const { data: prompt, error: promptError } = await supabase
    .from("speaking_prompts")
    .select("id")
    .eq("id", promptId)
    .eq("speaking_set_version_id", attempt.speaking_set_version_id)
    .maybeSingle();

  if (promptError || !prompt) {
    return {
      ok: false as const,
      message: "Câu hỏi không thuộc phiên luyện Speaking hiện tại.",
    };
  }

  return { ok: true as const };
}

export async function getR2UploadUrlAction(
  contentType: string,
  attemptId: string,
  promptId: string,
) {
  const parsedAttempt = uuidSchema.safeParse(attemptId);
  const parsedPrompt = uuidSchema.safeParse(promptId);
  if (!parsedAttempt.success || !parsedPrompt.success) {
    return {
      status: "error" as const,
      message: "Thông tin phiên thu âm không hợp lệ.",
    };
  }

  const normalizedMime = normalizeAudioMime(contentType);
  if (!normalizedMime) {
    return {
      status: "error" as const,
      message: "Định dạng audio không được hỗ trợ.",
    };
  }

  const { account } = await requireCompletedOnboarding();
  const userId = account.user.id;
  const supabase = await createSupabaseServerClient();

  const ownership = await assertOwnedAttemptAndPrompt(
    supabase,
    userId,
    parsedAttempt.data,
    parsedPrompt.data,
  );
  if (!ownership.ok) {
    return { status: "error" as const, message: ownership.message };
  }

  const extension = ALLOWED_AUDIO_MIME_EXTENSIONS[normalizedMime];
  const fileKey = `${userId}/speaking/${parsedAttempt.data}/${parsedPrompt.data}-${randomUUID()}${extension}`;

  try {
    const uploadUrl = await generateUploadUrl(fileKey, normalizedMime);
    return {
      status: "success" as const,
      uploadUrl,
      fileKey,
      mimeType: normalizedMime,
    };
  } catch (error) {
    console.error("Lỗi khi tạo Presigned URL R2:", error);
    return {
      status: "error" as const,
      message: "Không thể khởi tạo đường dẫn upload R2.",
    };
  }
}

export async function saveR2AudioAction(
  attemptId: string,
  promptId: string,
  fileKey: string,
  mimeType: string,
) {
  const parsedAttempt = uuidSchema.safeParse(attemptId);
  const parsedPrompt = uuidSchema.safeParse(promptId);
  if (!parsedAttempt.success || !parsedPrompt.success) {
    return {
      status: "error" as const,
      message: "Thông tin bài nói không hợp lệ.",
    };
  }

  const normalizedMime = normalizeAudioMime(mimeType);
  if (!normalizedMime) {
    return {
      status: "error" as const,
      message: "Định dạng audio không được hỗ trợ.",
    };
  }

  const { account } = await requireCompletedOnboarding();
  const userId = account.user.id;
  const expectedPrefix = `${userId}/speaking/${parsedAttempt.data}/`;

  if (
    !fileKey ||
    fileKey.length > 500 ||
    fileKey.includes("..") ||
    !fileKey.startsWith(expectedPrefix)
  ) {
    return {
      status: "error" as const,
      message: "Đường dẫn lưu trữ audio không hợp lệ.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const ownership = await assertOwnedAttemptAndPrompt(
    supabase,
    userId,
    parsedAttempt.data,
    parsedPrompt.data,
  );
  if (!ownership.ok) {
    return { status: "error" as const, message: ownership.message };
  }

  let verified;
  try {
    const head = await headR2Object(fileKey);
    if (!head || head.sizeBytes < 1 || head.sizeBytes > MAX_AUDIO_BYTES) {
      return {
        status: "error" as const,
        message:
          "File audio không tồn tại hoặc vượt quá dung lượng tối đa 15MB.",
      };
    }

    const bytes = await getR2ObjectBytes(fileKey, MAX_AUDIO_BYTES);
    if (!bytes) {
      return {
        status: "error" as const,
        message: "Không thể đọc dữ liệu audio từ R2 để xác minh.",
      };
    }

    verified = await verifySpeakingAudioBuffer(bytes, normalizedMime);
  } catch {
    return {
      status: "error" as const,
      message:
        "Audio không qua xác minh định dạng, dung lượng hoặc thời lượng (1s - 180s).",
    };
  }

  const { error } = await supabase.rpc("finalize_r2_speaking_upload", {
    p_attempt_id: parsedAttempt.data,
    p_prompt_id: parsedPrompt.data,
    p_storage_path: fileKey,
    p_mime_type: verified.mimeType,
    p_size_bytes: verified.sizeBytes,
    p_duration_seconds: verified.durationSeconds,
    p_sha256_checksum: verified.sha256Checksum,
  });

  if (error) {
    console.error("Lỗi khi lưu audio R2 vào DB:", error);
    return {
      status: "error" as const,
      message: "Không thể xác nhận bản ghi âm vào bài làm.",
    };
  }

  revalidatePath("/practice/speaking", "layout");

  return {
    status: "success" as const,
    durationSeconds: verified.durationSeconds,
  };
}

/**
 * Fallback Upload Audio thông qua Server Action nếu trình duyệt gặp lỗi CORS khi upload trực tiếp lên R2
 */
export async function uploadR2AudioFallbackAction(formData: FormData) {
  const file = formData.get("file");
  const attemptIdRaw = formData.get("attemptId");
  const promptIdRaw = formData.get("promptId");
  const mimeTypeRaw = formData.get("mimeType");

  if (
    !(file instanceof File) ||
    typeof attemptIdRaw !== "string" ||
    typeof promptIdRaw !== "string" ||
    typeof mimeTypeRaw !== "string"
  ) {
    return { status: "error" as const, message: "Dữ liệu audio không hợp lệ." };
  }

  const parsedAttempt = uuidSchema.safeParse(attemptIdRaw);
  const parsedPrompt = uuidSchema.safeParse(promptIdRaw);
  const normalizedMime = normalizeAudioMime(mimeTypeRaw);
  if (!parsedAttempt.success || !parsedPrompt.success || !normalizedMime) {
    return {
      status: "error" as const,
      message: "Thông tin audio không hợp lệ.",
    };
  }

  if (file.size < 1 || file.size > MAX_AUDIO_BYTES) {
    return {
      status: "error" as const,
      message: "Dung lượng audio phải nằm trong khoảng 1 byte đến 15MB.",
    };
  }

  const { account } = await requireCompletedOnboarding();
  const userId = account.user.id;
  const supabase = await createSupabaseServerClient();

  const ownership = await assertOwnedAttemptAndPrompt(
    supabase,
    userId,
    parsedAttempt.data,
    parsedPrompt.data,
  );
  if (!ownership.ok) {
    return { status: "error" as const, message: ownership.message };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let verified;
  try {
    verified = await verifySpeakingAudioBuffer(bytes, normalizedMime);
  } catch {
    return {
      status: "error" as const,
      message:
        "Audio không qua xác minh định dạng, dung lượng hoặc thời lượng (1s - 180s).",
    };
  }

  const extension = ALLOWED_AUDIO_MIME_EXTENSIONS[verified.mimeType];
  const fileKey = `${userId}/speaking/${parsedAttempt.data}/${parsedPrompt.data}-${randomUUID()}${extension}`;

  try {
    await putR2Object(fileKey, bytes, verified.mimeType);

    const { error } = await supabase.rpc("finalize_r2_speaking_upload", {
      p_attempt_id: parsedAttempt.data,
      p_prompt_id: parsedPrompt.data,
      p_storage_path: fileKey,
      p_mime_type: verified.mimeType,
      p_size_bytes: verified.sizeBytes,
      p_duration_seconds: verified.durationSeconds,
      p_sha256_checksum: verified.sha256Checksum,
    });

    if (error) {
      await deleteR2Objects([fileKey]).catch(() => {});
      return {
        status: "error" as const,
        message: "Không thể xác nhận bản ghi âm vào bài làm.",
      };
    }

    revalidatePath("/practice/speaking", "layout");
    return {
      status: "success" as const,
      durationSeconds: verified.durationSeconds,
    };
  } catch (err) {
    console.error("Lỗi fallback upload R2 qua Server:", err);
    return {
      status: "error" as const,
      message: "Không thể upload audio qua server fallback.",
    };
  }
}
