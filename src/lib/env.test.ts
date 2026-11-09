import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EnvironmentValidationError,
  inspectOptionalAiConfiguration,
  isR2Configured,
  parsePublicEnv,
  parseServerEnv,
} from "@/lib/env";

describe("parsePublicEnv", () => {
  it("accepts valid public Supabase values", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    });
  });

  it("returns an actionable error when values are missing", () => {
    expect(() => parsePublicEnv({})).toThrow(EnvironmentValidationError);
    expect(() => parsePublicEnv({})).toThrow("NEXT_PUBLIC_SUPABASE_URL");
    expect(() => parsePublicEnv({})).toThrow("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});

describe("parseServerEnv", () => {
  it("requires the canonical site URL in production", () => {
    expect(() => parseServerEnv({ NODE_ENV: "production" })).toThrow(
      "NEXT_PUBLIC_SITE_URL",
    );
  });

  it("keeps partial AI configuration out of core validation", () => {
    const env = parseServerEnv({
      NODE_ENV: "test",
      OPENAI_API_KEY: "test-key",
    });

    expect(inspectOptionalAiConfiguration(env).overall).toBe("misconfigured");
  });

  it("accepts an explicitly disabled AI configuration", () => {
    expect(parseServerEnv({ NODE_ENV: "test" })).toMatchObject({
      NODE_ENV: "test",
    });
  });

  it("requires server-only cleanup credentials in production", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://ielts.example.com",
      }),
    ).toThrow("STORAGE_CLEANUP_SECRET");
  });

  it("accepts core production config with AI disabled", () => {
    expect(
      parseServerEnv({
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://ielts.example.com",
        NEXT_PUBLIC_SUPPORT_EMAIL: "support@ielts.example.com",
        SPEAKING_PIPELINE_SIGNING_SECRET: "s".repeat(32),
        SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
        STORAGE_CLEANUP_SECRET: "c".repeat(32),
      }),
    ).toMatchObject({ NODE_ENV: "production" });
  });

  it("reports every missing production-required field without values", () => {
    try {
      parseServerEnv({ NODE_ENV: "production" });
      throw new Error("expected production validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect((error as EnvironmentValidationError).fields).toEqual(
        expect.arrayContaining([
          "NEXT_PUBLIC_SITE_URL",
          "NEXT_PUBLIC_SUPPORT_EMAIL",
          "SPEAKING_PIPELINE_SIGNING_SECRET",
          "SUPABASE_SERVICE_ROLE_KEY",
          "STORAGE_CLEANUP_SECRET",
        ]),
      );
    }
  });

  it("does not reject partial optional AI configuration as a core failure", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "test",
        OPENAI_WRITING_MODEL: "optional-model-without-provider",
      }),
    ).not.toThrow();
  });
});

describe("inspectOptionalAiConfiguration", () => {
  it("marks AI disabled when every optional provider value is absent", () => {
    expect(inspectOptionalAiConfiguration({})).toEqual({
      overall: "disabled",
      writing: "disabled",
      speaking: "disabled",
    });
  });

  it("marks orphan or partial provider values as misconfigured", () => {
    expect(
      inspectOptionalAiConfiguration({ OPENAI_API_KEY: "provider-key" }),
    ).toMatchObject({ overall: "misconfigured" });
    expect(
      inspectOptionalAiConfiguration({
        OPENAI_WRITING_MODEL: "writing-model",
      }),
    ).toMatchObject({ overall: "misconfigured", writing: "misconfigured" });
  });

  it("allows one configured AI capability while the other stays disabled", () => {
    expect(
      inspectOptionalAiConfiguration({
        OPENAI_API_KEY: "provider-key",
        OPENAI_WRITING_MODEL: "writing-model",
        WRITING_FEEDBACK_SIGNING_SECRET: "w".repeat(32),
      }),
    ).toEqual({
      overall: "configured",
      writing: "configured",
      speaking: "disabled",
    });
  });
});

describe("isR2Configured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when R2 configuration is omitted or partial", () => {
    vi.stubEnv("R2_ACCOUNT_ID", "");
    vi.stubEnv("R2_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("R2_BUCKET_NAME", "");
    vi.stubEnv("CLOUDFLARE_R2_ACCOUNT_ID", "");
    vi.stubEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", "");
    vi.stubEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("CLOUDFLARE_R2_BUCKET_NAME", "");

    expect(isR2Configured()).toBe(false);

    vi.stubEnv("R2_ACCOUNT_ID", "acc-123");
    expect(isR2Configured()).toBe(false);
  });

  it("returns true when standard or CLOUDFLARE_R2_* values are complete", () => {
    vi.stubEnv("R2_ACCOUNT_ID", "acc-123");
    vi.stubEnv("R2_ACCESS_KEY_ID", "key-123");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret-123");
    vi.stubEnv("R2_BUCKET_NAME", "speaking-bucket");

    expect(isR2Configured()).toBe(true);
  });
});
