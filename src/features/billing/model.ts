import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { SubscriptionTier } from "./schemas";

export async function getUserTier(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SubscriptionTier> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return "free";
  }
  return data.tier as SubscriptionTier;
}

export async function processWebhookEvent(
  supabaseAdmin: SupabaseClient<Database>,
  gateway: string,
  eventId: string,
  eventType: string,
  payload: Json,
): Promise<{ success: boolean; error?: string }> {
  // 1. Check if event is already processed (Idempotency)
  const { data: existing } = await supabaseAdmin
    .from("billing_events")
    .select("id")
    .eq("gateway", gateway)
    .eq("gateway_event_id", eventId)
    .single();

  if (existing) {
    return { success: true }; // Already processed
  }

  // 2. Insert event
  const { error: insertError } = await supabaseAdmin
    .from("billing_events")
    .insert({
      gateway,
      gateway_event_id: eventId,
      event_type: eventType,
      payload,
    });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // 3. Process the event based on gateway and type
  // This is where we update subscription status, etc.
  try {
    if (gateway === "sepay" && eventType === "payment_received") {
      // Handle SePay logic: parse transaction content to find user ID or order ID
      // Update subscription to 'active' or create new 'pro' subscription
      // Reset AI quotas
    }

    // Mark as processed
    await supabaseAdmin
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("gateway", gateway)
      .eq("gateway_event_id", eventId);

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await supabaseAdmin
      .from("billing_events")
      .update({ error_message: errorMessage })
      .eq("gateway", gateway)
      .eq("gateway_event_id", eventId);

    return { success: false, error: errorMessage };
  }
}
