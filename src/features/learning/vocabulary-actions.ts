"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/lib/validation/zod";

import { learningSlugSchema } from "@/features/learning/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireCompletedOnboarding } from "@/features/onboarding/server/learner-profile";
import { saveDraftRateLimit } from "@/lib/rate-limit";

const vocabularyReviewSchema = z.object({
  vocabularyEntryId: z.uuid(),
  familiarity: z.enum(["again", "learning", "mastered"]),
  currentSlug: learningSlugSchema,
  nextSlug: learningSlugSchema,
});

export async function recordVocabularyReviewAction(formData: FormData) {
  const parsed = vocabularyReviewSchema.safeParse({
    vocabularyEntryId: formData.get("vocabularyEntryId"),
    familiarity: formData.get("familiarity"),
    currentSlug: formData.get("currentSlug"),
    nextSlug: formData.get("nextSlug"),
  });
  if (!parsed.success) redirect("/learn/vocabulary?error=invalid-review");

  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_vocabulary_review", {
    p_vocabulary_entry_id: parsed.data.vocabularyEntryId,
    p_familiarity: parsed.data.familiarity,
  });
  if (error)
    redirect(`/learn/vocabulary/${parsed.data.currentSlug}?error=save`);

  revalidatePath("/learn/vocabulary");
  const destination =
    parsed.data.familiarity === "again"
      ? parsed.data.currentSlug
      : parsed.data.nextSlug;
  redirect(`/learn/vocabulary/${destination}?saved=1`);
}

const saveVocabSchema = z.object({
  term: z.string().min(1, "Term cannot be empty").max(255, "Term is too long"),
});

export async function saveVocabAction(input: { term: string }) {
  const parsed = saveVocabSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await requireCompletedOnboarding();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { success: rateLimitSuccess } = await saveDraftRateLimit.limit(
    `save_vocab_${user.id}`,
  );
  if (!rateLimitSuccess) {
    return { success: false, error: "Too many requests. Please slow down." };
  }

  const { error } = await supabase.from("vocabulary_vault").insert({
    user_id: user.id,
    term: parsed.data.term,
  });

  if (error) {
    // If unique violation (already saved), treat as success
    if (error.code === "23505") {
      return { success: true, alreadyExists: true };
    }
    console.error("Failed to save vocabulary:", error);
    return { success: false, error: "Failed to save vocabulary" };
  }

  return { success: true };
}

export async function checkWordInVaultAction(term: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, inVault: false };

    const { data } = await supabase
      .from("vocabulary_vault")
      .select("id")
      .eq("user_id", user.id)
      .eq("term", term.trim())
      .maybeSingle();

    return { success: true, inVault: !!data };
  } catch {
    return { success: false, inVault: false };
  }
}

export async function getSavedVaultTermsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: true, terms: [] };

    const { data } = await supabase
      .from("vocabulary_vault")
      .select("term")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    return { success: true, terms: data ? data.map((r) => r.term) : [] };
  } catch {
    return { success: false, terms: [] };
  }
}
