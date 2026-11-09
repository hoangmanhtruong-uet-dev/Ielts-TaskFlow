"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function buyStreakFreezeAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase.rpc("buy_streak_freeze", {
    p_cost: 500,
  });

  if (error) {
    const message = String(error.message ?? "");
    if (message.includes("insufficient xp")) {
      return {
        success: false,
        error: "Không đủ XP để đổi Streak Freeze (Cần 500 XP)",
      };
    }
    if (message.includes("maximum streak freeze")) {
      return {
        success: false,
        error: "Bạn đã giữ tối đa 5 Streak Freeze.",
      };
    }
    return { success: false, error: "Có lỗi xảy ra khi đổi" };
  }

  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { success: true };
}
