import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Billing feature flag.
 *
 * Khi launch miễn phí (giai đoạn đầu theo Plan Go-Live v1.0.2), billing vẫn
 * được giữ code (Phase 11) nhưng không bật. Khi `BILLING_ENABLED` = "false"
 * (hoặc không set), helper trả về "free cho tất cả" một cách tường minh, không
 * cần truy vấn bảng `subscriptions`.
 */
export async function getUserSubscriptionStatus(): Promise<{
  isPremium: boolean;
  userId: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isPremium: false, userId: null };
  }

  // Billing tắt → mọi người dùng được coi là free tier, rõ ràng và tường minh.
  const isBillingEnabled =
    process.env.BILLING_ENABLED === "true" || process.env.NODE_ENV === "test";
  if (!isBillingEnabled) {
    return { isPremium: false, userId: user.id };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isPremium = data?.tier === "pro";

  return {
    isPremium,
    userId: user.id,
  };
}
