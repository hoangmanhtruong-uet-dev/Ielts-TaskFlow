"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentAccount } from "@/features/auth/server/account";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { submitAnswer } from "@/lib/dictation/queries";
import {
  startDictationSchema,
  submitDictationSchema,
  type SubmitDictationInput,
} from "./schemas";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function startDictationAction(formData: FormData) {
  const parsed = startDictationSchema.safeParse({
    exerciseSlug: formData.get("exerciseSlug"),
  });
  if (!parsed.success) redirect("/practice/listening/dictation?error=invalid");

  await requireCompletedOnboarding();
  revalidatePath("/practice/listening/dictation");
  redirect(`/practice/listening/dictation/${parsed.data.exerciseSlug}`);
}

export async function submitDictationAction(input: SubmitDictationInput) {
  const parsed = submitDictationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: "Dữ liệu nộp bài không hợp lệ.",
    };
  }

  const [account] = await Promise.all([
    requireCurrentAccount(),
    requireCompletedOnboarding(),
  ]);

  const slug = parsed.data.exerciseSlug;
  if (slug.startsWith("db-")) {
    const exerciseId = slug.slice(3);
    if (UUID_REGEX.test(exerciseId)) {
      const entries = Object.entries(parsed.data.answers).filter(
        ([sentenceId, text]) =>
          UUID_REGEX.test(sentenceId) && text.trim().length > 0,
      );
      await Promise.allSettled(
        entries.map(([sentenceId, userInput]) =>
          submitAnswer({
            userId: account.user.id,
            exerciseId,
            sentenceId,
            userInput: userInput.trim(),
            timeSpent: 0,
            replayCount: 0,
          }),
        ),
      );
    }
  }

  revalidatePath("/dictation");
  revalidatePath("/practice/listening/dictation");
  revalidatePath(`/practice/listening/dictation/${slug}`);
  return { status: "success" as const, exerciseSlug: slug };
}
