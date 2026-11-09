"use server";

import { submitAttemptRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SubmitExerciseSchema, type SubmitExerciseInput } from "../schema";

export async function submitExerciseAction(input: SubmitExerciseInput) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Rate limit check
    const { success: rateLimitSuccess } = await submitAttemptRateLimit.limit(
      `submit_attempt_${user.id}`,
    );
    if (!rateLimitSuccess) {
      return { success: false, error: "Too many requests. Please slow down." };
    }

    // Validate input
    const parsed = SubmitExerciseSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid data format" };
    }

    const { attemptId, answers } = parsed.data;

    // Call the RPC function for server-authoritative grading
    const { data, error } = await supabase.rpc("submit_exercise_attempt", {
      p_attempt_id: attemptId,
      p_user_answers: answers,
    });

    if (error) {
      console.error("Submit exercise error:", error);
      return {
        success: false,
        error: error.message || "Failed to submit exercise",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: "Internal server error" };
  }
}

// touched for audit
