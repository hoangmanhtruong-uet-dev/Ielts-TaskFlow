"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateProgressSchema = z.object({
  lessonId: z.string().uuid(),
  lastPositionSeconds: z.number().int().min(0),
  completionPercentage: z.number().int().min(0).max(100),
});

type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;

export async function updateLessonProgressAction(input: UpdateProgressInput) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = UpdateProgressSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid data" };
    }

    const { lessonId, lastPositionSeconds, completionPercentage } = parsed.data;
    const status = completionPercentage >= 95 ? "completed" : "in_progress";

    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status,
        last_position_seconds: lastPositionSeconds,
        completion_percentage: completionPercentage,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    if (error) {
      console.error("Update progress error:", error);
      return { success: false, error: "Failed to update progress" };
    }

    return { success: true };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: "Internal server error" };
  }
}
