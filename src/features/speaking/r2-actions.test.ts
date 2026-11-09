import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const r2ActionMocks = vi.hoisted(() => ({
  requireCompletedOnboarding: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  generateUploadUrl: vi.fn(),
}));

vi.mock("@/features/onboarding/server/learner-profile", () => ({
  requireCompletedOnboarding: r2ActionMocks.requireCompletedOnboarding,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: r2ActionMocks.createSupabaseServerClient,
}));

vi.mock("@/lib/r2", () => ({
  deleteR2Objects: vi.fn(),
  generateUploadUrl: r2ActionMocks.generateUploadUrl,
  getR2ObjectBytes: vi.fn(),
  headR2Object: vi.fn(),
  putR2Object: vi.fn(),
}));

import { getR2UploadUrlAction } from "@/features/speaking/r2-actions";

const ATTEMPT_ID = "11111111-1111-4111-8111-111111111111";
const PROMPT_ID = "22222222-2222-4222-8222-222222222222";
const USER_ID = "33333333-3333-4333-8333-333333333333";

describe("getR2UploadUrlAction", () => {
  beforeEach(() => {
    vi.stubEnv("R2_ACCOUNT_ID", "");
    vi.stubEnv("R2_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("R2_BUCKET_NAME", "");
    vi.stubEnv("CLOUDFLARE_R2_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "");
    vi.stubEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("CLOUDFLARE_R2_BUCKET_NAME", "");

    r2ActionMocks.requireCompletedOnboarding.mockResolvedValue({
      account: { user: { id: USER_ID } },
    });

    r2ActionMocks.createSupabaseServerClient.mockResolvedValue({
      from: (table: string) => {
        if (table === "speaking_attempts") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: async () => ({
                      data: {
                        id: ATTEMPT_ID,
                        speaking_set_version_id: "ver-1",
                        status: "in_progress",
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          };
        }

        if (table === "speaking_prompts") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({
                    data: { id: PROMPT_ID },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns unconfigured when Cloudflare R2 env vars are omitted", async () => {
    const result = await getR2UploadUrlAction(
      "audio/webm",
      ATTEMPT_ID,
      PROMPT_ID,
    );

    expect(result.status).toBe("unconfigured");
    expect(r2ActionMocks.generateUploadUrl).not.toHaveBeenCalled();
  });

  it("returns a presigned R2 URL when Cloudflare R2 env vars are set", async () => {
    vi.stubEnv("R2_ACCOUNT_ID", "acc-123");
    vi.stubEnv("R2_ACCESS_KEY_ID", "key-123");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret-123");
    vi.stubEnv("R2_BUCKET_NAME", "speaking-bucket");
    r2ActionMocks.generateUploadUrl.mockResolvedValue(
      "https://r2.example.com/presigned",
    );

    const result = await getR2UploadUrlAction(
      "audio/webm;codecs=opus",
      ATTEMPT_ID,
      PROMPT_ID,
    );

    expect(result).toMatchObject({
      status: "success",
      uploadUrl: "https://r2.example.com/presigned",
      mimeType: "audio/webm",
    });
    expect(r2ActionMocks.generateUploadUrl).toHaveBeenCalledTimes(1);
  });
});
