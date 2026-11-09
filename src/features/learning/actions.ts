"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import {
  mapProgressError,
  type LearningProgressActionState,
} from "@/features/learning/action-state";
import { lessonProgressMutationSchema } from "@/features/learning/schemas";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logServerEvent } from "@/server/observability/logger";
import { getServerRequestId } from "@/server/observability/request-context";

export async function openLessonSectionAction(input: unknown) {
  return mutateLessonProgress("open", input);
}

export async function completeLessonSectionAction(
  _previousState: LearningProgressActionState,
  formData: FormData,
) {
  return mutateLessonProgress("complete", {
    lessonId: formData.get("lessonId"),
    sectionId: formData.get("sectionId"),
    moduleSlug: formData.get("moduleSlug"),
    lessonSlug: formData.get("lessonSlug"),
  });
}

async function mutateLessonProgress(
  operation: "open" | "complete",
  input: unknown,
): Promise<LearningProgressActionState> {
  const requestId = await getServerRequestId();
  const parsed = lessonProgressMutationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Thông tin bài học không hợp lệ. Hãy tải lại trang và thử lại.",
      requestId,
    };
  }

  try {
    const { account } = await requireCompletedOnboarding();
    const supabase =
      (await createSupabaseServerClient()) as unknown as SupabaseClient;

    let alreadyCompletedSection = false;
    if (operation === "complete") {
      const { data: existingSection } = await supabase
        .from("learner_section_progress")
        .select("completed_at")
        .eq("user_id", account.user.id)
        .eq("lesson_id", parsed.data.lessonId)
        .eq("section_id", parsed.data.sectionId)
        .maybeSingle();

      alreadyCompletedSection = Boolean(existingSection?.completed_at);
    }

    const functionName =
      operation === "complete"
        ? "complete_lesson_section"
        : "open_lesson_section";
    const { error } = await supabase.rpc(functionName, {
      p_lesson_id: parsed.data.lessonId,
      p_section_id: parsed.data.sectionId,
    });

    if (error) {
      logServerEvent("warn", {
        event: "learning.progress.rejected",
        requestId,
        route: "mutateLessonProgress",
        stage: operation,
        errorCode: error.code ?? "PROGRESS_PROVIDER_ERROR",
      });
      return mapProgressError(error.code, requestId);
    }

    if (
      operation === "complete" &&
      !alreadyCompletedSection &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    ) {
      try {
        const admin = createSupabaseAdminClient();
        await admin.rpc("award_xp", {
          target_user_id: account.user.id,
          xp_amount: 10,
          xp_source: "lesson_section_completed",
        });
      } catch (xpError) {
        logServerEvent("warn", {
          event: "learning.award_xp.skipped",
          requestId,
          route: "mutateLessonProgress",
          stage: "award_xp",
          errorCode: "XP_AWARD_FAILED",
          error: xpError,
        });
      }
    }

    revalidateLearningPaths(parsed.data.moduleSlug, parsed.data.lessonSlug);
    return {
      status: "success",
      message:
        operation === "complete"
          ? "Tiến độ phần học đã được lưu."
          : "Vị trí đang học đã được lưu.",
      requestId,
    };
  } catch (error) {
    logServerEvent("error", {
      event: "learning.progress.failed",
      requestId,
      route: "mutateLessonProgress",
      stage: operation,
      errorCode: "PROGRESS_UNEXPECTED_ERROR",
      error,
    });
    return {
      status: "error",
      message: "Không thể lưu tiến độ lúc này. Hãy thử lại.",
      requestId,
    };
  }
}

function revalidateLearningPaths(moduleSlug: string, lessonSlug: string) {
  revalidatePath(`/learn/${moduleSlug}/${lessonSlug}`);
  revalidatePath(`/learn/${moduleSlug}`);
  revalidatePath("/learn");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}
