import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cleanupMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  deleteR2Objects: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: cleanupMocks.createSupabaseAdminClient,
}));

vi.mock("@/lib/r2", () => ({
  deleteR2Objects: cleanupMocks.deleteR2Objects,
}));

import { GET, POST } from "@/app/api/internal/storage-cleanup/route";

describe("/api/internal/storage-cleanup", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron_secret_at_least_32_characters_long_123");
    vi.stubEnv("STORAGE_CLEANUP_SECRET", "cleanup_secret_32_chars_long_1234");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("correlates and safely logs a rejected request", async () => {
    const output = vi.spyOn(console, "warn").mockImplementation(() => {});
    const request = new Request(
      "https://private.example.com/api/internal/storage-cleanup",
      {
        method: "POST",
        headers: {
          authorization: "Bearer do-not-log-this",
          "x-request-id": "req-cleanup-rejected",
        },
      },
    );

    const response = await POST(request as never);
    const body = await response.json();
    const serializedLog = String(output.mock.calls[0]?.[0]);

    expect(response.status).toBe(404);
    expect(response.headers.get("x-request-id")).toBe("req-cleanup-rejected");
    expect(body.error.requestId).toBe("req-cleanup-rejected");
    expect(serializedLog).toContain("storage_cleanup.rejected");
    expect(serializedLog).not.toContain("do-not-log-this");
  });

  it("supports GET with CRON_SECRET and splits deletion across cloudflare-r2 and speaking-recordings", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const intentUpdates: Array<Record<string, unknown>> = [];
    const assetUpdates: Array<{
      values: Record<string, unknown>;
      ids: string[];
    }> = [];
    const supabaseRemove = vi.fn().mockResolvedValue({ error: null });

    cleanupMocks.deleteR2Objects.mockResolvedValue({
      deletedKeys: ["u1/speaking/r2-clip.webm"],
      failedKeys: [],
    });

    cleanupMocks.createSupabaseAdminClient.mockReturnValue({
      from: (table: string) => {
        if (table === "speaking_upload_intents") {
          return {
            update: (values: Record<string, unknown>) => {
              if ("status" in values) {
                return {
                  eq: () => ({
                    lte: () => ({
                      select: async () => ({
                        data: [{ id: "int-1" }],
                        error: null,
                      }),
                    }),
                  }),
                };
              }
              return {
                in: async (_col: string, ids: string[]) => {
                  intentUpdates.push({ ...values, ids });
                  return { error: null };
                },
              };
            },
            select: () => ({
              eq: () => ({
                is: () => ({
                  order: () => ({
                    limit: async () => ({
                      data: [{ id: "int-1", storage_path: "u1/intent-1.webm" }],
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "speaking_audio_assets") {
          return {
            update: (values: Record<string, unknown>) => ({
              eq: () => ({
                in: async (_col: string, ids: string[]) => {
                  assetUpdates.push({ values, ids });
                  return { error: null };
                },
              }),
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            id: "asset-r2",
            bucket_id: "cloudflare-r2",
            storage_path: "u1/speaking/r2-clip.webm",
          },
          {
            id: "asset-supa",
            bucket_id: "speaking-recordings",
            storage_path: "u1/supa-clip.webm",
          },
        ],
        error: null,
      }),
      storage: {
        from: () => ({
          remove: supabaseRemove,
        }),
      },
    });

    const request = new Request(
      "https://private.example.com/api/internal/storage-cleanup",
      {
        method: "GET",
        headers: {
          authorization: "Bearer cron_secret_at_least_32_characters_long_123",
          "x-request-id": "req-cleanup-cron",
        },
      },
    );

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      status: "completed",
      expiredIntents: 1,
      deletedAssets: 2,
    });
    expect(supabaseRemove).toHaveBeenCalledWith([
      "u1/intent-1.webm",
      "u1/supa-clip.webm",
    ]);
    expect(cleanupMocks.deleteR2Objects).toHaveBeenCalledWith([
      "u1/speaking/r2-clip.webm",
    ]);
    expect(intentUpdates[0]?.ids).toEqual(["int-1"]);
    expect(assetUpdates[0]?.ids).toEqual(["asset-supa", "asset-r2"]);
  });

  it("finalizes succeeded deletes and returns 500 if any R2 object fails deletion", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const finalizedAssetIds: string[][] = [];

    cleanupMocks.deleteR2Objects.mockResolvedValue({
      deletedKeys: ["u1/speaking/ok.webm"],
      failedKeys: ["u1/speaking/stuck.webm"],
    });

    cleanupMocks.createSupabaseAdminClient.mockReturnValue({
      from: (table: string) => {
        if (table === "speaking_upload_intents") {
          return {
            update: () => ({
              eq: () => ({
                lte: () => ({
                  select: async () => ({ data: [], error: null }),
                }),
              }),
            }),
            select: () => ({
              eq: () => ({
                is: () => ({
                  order: () => ({
                    limit: async () => ({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          };
        }
        return {
          update: () => ({
            eq: () => ({
              in: async (_col: string, ids: string[]) => {
                finalizedAssetIds.push(ids);
                return { error: null };
              },
            }),
          }),
        };
      },
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            id: "asset-ok",
            bucket_id: "cloudflare-r2",
            storage_path: "u1/speaking/ok.webm",
          },
          {
            id: "asset-stuck",
            bucket_id: "cloudflare-r2",
            storage_path: "u1/speaking/stuck.webm",
          },
        ],
        error: null,
      }),
      storage: {
        from: () => ({
          remove: vi.fn(),
        }),
      },
    });

    const request = new Request(
      "https://private.example.com/api/internal/storage-cleanup",
      {
        method: "GET",
        headers: {
          authorization: "Bearer cron_secret_at_least_32_characters_long_123",
          "x-request-id": "req-cleanup-partial",
        },
      },
    );

    const response = await GET(request as never);
    expect(response.status).toBe(500);
    expect(finalizedAssetIds).toEqual([["asset-ok"]]);
  });
});
