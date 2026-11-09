import { createHmac, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

import { webhookRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "@/lib/validation/zod";
import { logServerEvent } from "@/server/observability/logger";
import type { Json } from "@/types/database";

const MAX_REPLAY_WINDOW_SECONDS = 5 * 60;

const billingWebhookPayloadSchema = z.object({
  eventId: z.string().trim().min(1).max(128).optional(),
  id: z.union([z.string().trim().min(1).max(128), z.number()]).optional(),
  transaction_id: z
    .union([z.string().trim().min(1).max(128), z.number()])
    .optional(),
  gateway: z.enum(["sepay", "stripe", "vnpay", "payos"]).default("sepay"),
  eventType: z
    .enum([
      "payment_success",
      "subscription.activated",
      "subscription.renewed",
      "subscription.past_due",
      "subscription.canceled",
    ])
    .optional(),
  event: z
    .enum([
      "payment_success",
      "subscription.activated",
      "subscription.renewed",
      "subscription.past_due",
      "subscription.canceled",
    ])
    .optional(),
  userId: z.string().uuid().optional(),
  metadata: z
    .object({
      userId: z.string().uuid().optional(),
    })
    .optional(),
  tier: z.enum(["free", "pro"]).default("pro"),
  status: z.enum(["active", "trialing", "past_due", "canceled"]).optional(),
  periodEnd: z.iso.datetime().optional(),
});

function getClientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip"
  );
}

function parseTimestampSeconds(rawHeader: string | null): number | null {
  if (!rawHeader?.trim()) return null;
  const num = Number(rawHeader.trim());
  if (!Number.isFinite(num) || num <= 0) return null;
  // Normalize ms timestamps (> 10^12) to unix seconds
  return num > 1_000_000_000_000 ? Math.floor(num / 1000) : Math.floor(num);
}

export async function POST(req: NextRequest) {
  const reqId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const ip = getClientIpFromHeaders(req.headers);
    const { success: rateAllowed } = await webhookRateLimit.limit(
      `webhook_${ip}`,
    );
    if (!rateAllowed) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (process.env.BILLING_ENABLED !== "true") {
      return NextResponse.json(
        { error: "Billing integration is currently disabled" },
        { status: 503 },
      );
    }

    const secret = process.env.BILLING_WEBHOOK_SECRET?.trim();
    if (!secret) {
      logServerEvent("error", {
        event: "billing.webhook_misconfigured",
        requestId: reqId,
        route: "/api/webhooks/billing",
        stage: "config",
        errorCode: "MISSING_WEBHOOK_SECRET",
      });
      return NextResponse.json(
        { error: "Billing webhook secret is not configured" },
        { status: 503 },
      );
    }

    const rawSignature = (
      req.headers.get("x-signature") ||
      req.headers.get("x-webhook-signature") ||
      ""
    ).trim();
    const signatureHex = rawSignature.replace(/^sha256=/i, "");
    const timestampHeader = req.headers.get("x-webhook-timestamp");
    const timestampSec = parseTimestampSeconds(timestampHeader);

    if (!timestampSec) {
      return NextResponse.json(
        { error: "Missing or invalid webhook timestamp" },
        { status: 401 },
      );
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - timestampSec) > MAX_REPLAY_WINDOW_SECONDS) {
      return NextResponse.json(
        { error: "Webhook timestamp outside allowed window" },
        { status: 401 },
      );
    }

    if (!/^[0-9a-f]{64}$/i.test(signatureHex)) {
      return NextResponse.json(
        { error: "Invalid webhook signature format" },
        { status: 401 },
      );
    }

    const rawBody = await req.text();
    const signedPayload = `${timestampSec}.${rawBody}`;
    const computedHex = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    const sigBuffer = Buffer.from(signatureHex.toLowerCase(), "hex");
    const compBuffer = Buffer.from(computedHex, "hex");
    if (
      sigBuffer.length !== compBuffer.length ||
      !timingSafeEqual(sigBuffer, compBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }

    let jsonBody: Json;
    try {
      jsonBody = JSON.parse(rawBody) as Json;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    const parsed = billingWebhookPayloadSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid webhook payload", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const rawEventId =
      payload.eventId ??
      payload.id ??
      payload.transaction_id ??
      req.headers.get("x-event-id");
    if (!rawEventId) {
      return NextResponse.json(
        { error: "Missing event identifier" },
        { status: 400 },
      );
    }

    const eventId = String(rawEventId);
    const gateway = payload.gateway;
    const eventType = payload.eventType ?? payload.event ?? "payment_success";
    const userId = payload.userId ?? payload.metadata?.userId;

    const supabaseAdmin = createSupabaseAdminClient();

    const { data: existing } = await supabaseAdmin
      .from("billing_events")
      .select("id, processed_at")
      .eq("gateway", gateway)
      .eq("gateway_event_id", eventId)
      .maybeSingle();

    if (existing?.processed_at) {
      return NextResponse.json(
        { status: "already_processed" },
        { status: 200 },
      );
    }

    if (!existing) {
      const { error: insertEventError } = await supabaseAdmin
        .from("billing_events")
        .insert({
          gateway,
          gateway_event_id: eventId,
          event_type: eventType,
          payload: jsonBody,
        });

      if (insertEventError?.code === "23505") {
        return NextResponse.json(
          { status: "already_processed" },
          { status: 200 },
        );
      }
      if (insertEventError) {
        return NextResponse.json(
          { error: "Failed to record billing event" },
          { status: 500 },
        );
      }
    }

    if (userId) {
      const nowIso = new Date().toISOString();
      const targetStatus =
        eventType === "subscription.canceled"
          ? "canceled"
          : eventType === "subscription.past_due"
            ? "past_due"
            : (payload.status ?? "active");
      const targetTier = targetStatus === "canceled" ? "free" : payload.tier;
      const periodEnd =
        payload.periodEnd ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due"])
        .maybeSingle();

      if (existingSub?.id) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            tier: targetTier,
            status: targetStatus,
            payment_gateway: gateway,
            gateway_subscription_id: eventId,
            current_period_start: nowIso,
            current_period_end: periodEnd,
            updated_at: nowIso,
          })
          .eq("id", existingSub.id);
      } else {
        await supabaseAdmin.from("subscriptions").insert({
          user_id: userId,
          tier: targetTier,
          status: targetStatus,
          payment_gateway: gateway,
          gateway_subscription_id: eventId,
          current_period_start: nowIso,
          current_period_end: periodEnd,
        });
      }
    }

    await supabaseAdmin
      .from("billing_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("gateway", gateway)
      .eq("gateway_event_id", eventId);

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    logServerEvent("error", {
      event: "billing.webhook_failed",
      requestId: reqId,
      route: "/api/webhooks/billing",
      stage: "handler",
      errorCode: "INTERNAL_ERROR",
      error: err,
    });
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 },
    );
  }
}
