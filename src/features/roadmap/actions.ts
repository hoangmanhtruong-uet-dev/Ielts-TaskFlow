"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentAccount } from "@/features/auth/server/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateDailyStudyMinutesAction(minutes: number) {
  const safeMinutes = Math.trunc(Number(minutes));
  if (!Number.isFinite(safeMinutes) || safeMinutes < 10 || safeMinutes > 240) {
    return {
      success: false,
      error: "Thời lượng học mỗi ngày phải nằm trong khoảng 10 đến 240 phút.",
    };
  }

  const account = await requireCurrentAccount();
  const supabase = await createSupabaseServerClient();

  const { data: existing, error: readError } = await supabase
    .from("learner_profiles")
    .select("onboarding_completed_at")
    .eq("user_id", account.user.id)
    .maybeSingle();

  if (readError || !existing?.onboarding_completed_at) {
    return {
      success: false,
      error:
        "Vui lòng hoàn tất onboarding trước khi cập nhật mục tiêu học tập.",
    };
  }

  const { error } = await supabase
    .from("learner_profiles")
    .update({ daily_study_minutes: safeMinutes })
    .eq("user_id", account.user.id);

  if (error) {
    return {
      success: false,
      error: "Không thể lưu tốc độ học tập lúc này.",
    };
  }

  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
    dailyStudyMinutes: safeMinutes,
  };
}
