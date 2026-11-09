import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rateLimitMock = vi.hoisted(() => ({
  limit: vi.fn(),
}));

type ExistingBillingEvent = { id: string; processed_at: string | null } | null;
type ExistingSubscription = { id: string } | null;

const dbState = vi.hoisted(() => ({
  existingEvent: null as ExistingBillingEvent,
  insertEventError: null as { code?: string; message?: string } | null,
  existingSubscription: null as ExistingSubscription,
  billingEventsInserted: [] as Array<Record<string, unknown>>,
  billingEventsUpdated: [] as Array<Record<string, unknown>>,
  subscriptionsInserted: [] as Array<Record<string, unknown>>,
  subscriptionsUpdated: [] as Array<{
    values: Record<string, unknown>;
    id: string;
  }>,
}));

vi.mock("@/lib/rate-limit", () => ({
  webhookRateLimit: rateLimitMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "billing_events") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: dbState.existingEvent,
                  error: null,
                }),
              }),
            }),
          }),
          insert: async (payload: Record<string, unknown>) => {
            dbState.billingEventsInserted.push(payload);
            return { error: dbState.insertEventError };
          },
          update: (payload: Record<string, unknown>) => {
            dbState.billingEventsUpdated.push(payload);
            return {
              eq: () => ({
                eq: async () => ({ error: null }),
              }),
            };
          },
        };
      }

      if (table === "subscriptions") {
        return {
          select: () => ({
            eq: () => ({
              in: () => ({
                maybeSingle: async () => ({
                  data: dbState.existingSubscription,
                  error: null,
                }),
              }),
            }),
          }),
          insert: async (payload: Record<string, unknown>) => {
            dbState.subscriptionsInserted.push(payload);
            return { error: null };
          },
          update: (values: Record<string, unknown>) => ({
            eq: async (_column: string, id: string) => {
              dbState.subscriptionsUpdated.push({ values, id });
              return { error: null };
            },
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  })),
}));

import { POST } from "@/app/api/webhooks/billing/route";

const TEST_SECRET = "whsec_test_billing_secret_key_for_hmac_sha256";
const USER_ID = "11111111-1111-4111-8111-111111111111";

function signPayload(secret: string, timestampSec: number, body: string) {
  return createHmac("sha256", secret)
    .update(`${timestampSec}.${body}`)
    .digest("hex");
}

function makeRequest(
  body: string,
  headers: Record<string, string | undefined> = {},
) {
  const normalized = new Headers({
    "content-type": "application/json",
    "x-request-id": "req-billing-test",
  });
  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined) normalized.set(k, v);
  }
  return new Request("https://app.example.com/api/webhooks/billing", {
    method: "POST",
    headers: normalized,
    body,
  });
}

describe("POST /api/webhooks/billing", () => {
  beforeEach(() => {
    vi.stubEnv("BILLING_ENABLED", "true");
    vi.stubEnv("BILLING_WEBHOOK_SECRET", TEST_SECRET);
    rateLimitMock.limit.mockResolvedValue({ success: true });
    dbState.existingEvent = null;
    dbState.insertEventError = null;
    dbState.existingSubscription = null;
    dbState.billingEventsInserted = [];
    dbState.billingEventsUpdated = [];
    dbState.subscriptionsInserted = [];
    dbState.subscriptionsUpdated = [];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("returns 503 when billing is disabled", async () => {
    vi.stubEnv("BILLING_ENABLED", "false");
    const response = await POST(makeRequest("{}") as never);
    expect(response.status).toBe(503);
  });

  it("fails closed with 503 when BILLING_WEBHOOK_SECRET is missing", async () => {
    vi.stubEnv("BILLING_WEBHOOK_SECRET", "");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(makeRequest("{}") as never);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "Billing webhook secret is not configured",
    });
  });

  it("rejects missing, invalid, or expired timestamps with 401", async () => {
    const body = JSON.stringify({ eventId: "evt_1" });

    const missingTs = await POST(makeRequest(body) as never);
    expect(missingTs.status).toBe(401);

    const staleTs = Math.floor(Date.now() / 1000) - 600;
    const sig = signPayload(TEST_SECRET, staleTs, body);
    const expired = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(staleTs),
        "x-webhook-signature": sig,
      }) as never,
    );
    expect(expired.status).toBe(401);
  });

  it("rejects malformed or invalid HMAC signatures with 401", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      eventId: "evt_bad_sig",
      gateway: "sepay",
      userId: USER_ID,
    });

    const malformed = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-signature": "not-hex",
      }) as never,
    );
    expect(malformed.status).toBe(401);

    const wrongSig = signPayload("wrong_secret", nowSec, body);
    const rejected = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-webhook-signature": `sha256=${wrongSig}`,
      }) as never,
    );
    expect(rejected.status).toBe(401);
    expect(dbState.subscriptionsInserted).toHaveLength(0);
  });

  it("treats already-processed events and 23505 duplicates as idempotent 200", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      eventId: "evt_replay",
      gateway: "stripe",
      eventType: "payment_success",
      userId: USER_ID,
      tier: "pro",
    });
    const sig = signPayload(TEST_SECRET, nowSec, body);

    dbState.existingEvent = {
      id: "be-1",
      processed_at: "2026-11-09T00:00:00.000Z",
    };

    const replayResponse = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-webhook-signature": sig,
      }) as never,
    );
    expect(replayResponse.status).toBe(200);
    expect(await replayResponse.json()).toEqual({
      status: "already_processed",
    });
    expect(dbState.subscriptionsInserted).toHaveLength(0);

    dbState.existingEvent = null;
    dbState.insertEventError = { code: "23505", message: "duplicate key" };

    const raceResponse = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-webhook-signature": sig,
      }) as never,
    );
    expect(raceResponse.status).toBe(200);
    expect(await raceResponse.json()).toEqual({ status: "already_processed" });
    expect(dbState.subscriptionsInserted).toHaveLength(0);
  });

  it("activates a new Pro subscription and marks billing_events.processed_at", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      eventId: "evt_pro_activate",
      gateway: "payos",
      eventType: "subscription.activated",
      userId: USER_ID,
      tier: "pro",
      periodEnd: "2026-12-09T00:00:00.000Z",
    });
    const sig = signPayload(TEST_SECRET, nowSec, body);

    const response = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-signature": `sha256=${sig}`,
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "success" });
    expect(dbState.billingEventsInserted).toHaveLength(1);
    expect(dbState.subscriptionsInserted).toHaveLength(1);
    expect(dbState.subscriptionsInserted[0]).toMatchObject({
      user_id: USER_ID,
      tier: "pro",
      status: "active",
      payment_gateway: "payos",
      gateway_subscription_id: "evt_pro_activate",
      current_period_end: "2026-12-09T00:00:00.000Z",
    });
    expect(dbState.billingEventsUpdated).toHaveLength(1);
    expect(dbState.billingEventsUpdated[0]).toMatchObject({
      processed_at: expect.any(String),
    });
  });

  it("downgrades an existing subscription to free on subscription.canceled", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    dbState.existingSubscription = { id: "sub-existing-1" };
    const body = JSON.stringify({
      eventId: "evt_cancel",
      gateway: "stripe",
      eventType: "subscription.canceled",
      userId: USER_ID,
      tier: "pro",
    });
    const sig = signPayload(TEST_SECRET, nowSec, body);

    const response = await POST(
      makeRequest(body, {
        "x-webhook-timestamp": String(nowSec),
        "x-webhook-signature": sig,
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(dbState.subscriptionsUpdated).toEqual([
      {
        id: "sub-existing-1",
        values: expect.objectContaining({
          tier: "free",
          status: "canceled",
          payment_gateway: "stripe",
          gateway_subscription_id: "evt_cancel",
        }),
      },
    ]);
  });
});
