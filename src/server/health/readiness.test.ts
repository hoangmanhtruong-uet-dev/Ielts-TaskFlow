import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertProductionReadiness,
  DependencyReadinessError,
} from "@/server/health/readiness";

const REQUIRED_ENV = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
  NEXT_PUBLIC_SITE_URL: "https://private.example.com",
  NEXT_PUBLIC_SUPPORT_EMAIL: "support@example.com",
  SPEAKING_PIPELINE_SIGNING_SECRET: "s".repeat(32),
  SUPABASE_SERVICE_ROLE_KEY: "server-only-value",
  STORAGE_CLEANUP_SECRET: "c".repeat(32),
} as const;

function stubEnvironment() {
  for (const [name, value] of Object.entries(REQUIRED_ENV)) {
    vi.stubEnv(name, value);
  }
  for (const name of [
    "OPENAI_API_KEY",
    "OPENAI_WRITING_MODEL",
    "WRITING_FEEDBACK_SIGNING_SECRET",
    "OPENAI_SPEAKING_TRANSCRIPTION_MODEL",
    "OPENAI_SPEAKING_FEEDBACK_MODEL",
  ]) {
    vi.stubEnv(name, "");
  }
}

function healthyResponse(url: string | URL) {
  const pathname = new URL(String(url)).pathname;
  if (pathname === "/auth/v1/health")
    return Promise.resolve(new Response(null, { status: 200 }));
  if (pathname === "/rest/v1/learning_modules")
    return Promise.resolve(Response.json([]));
  if (pathname === "/storage/v1/bucket/speaking-recordings")
    return Promise.resolve(
      Response.json({ id: "speaking-recordings", public: false }),
    );
  return Promise.resolve(new Response(null, { status: 404 }));
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("production dependency readiness", () => {
  it("checks Auth, PostgREST/database and the private Storage bucket", async () => {
    stubEnvironment();
    const fetchMock = vi.fn((url: string | URL, init?: RequestInit) => {
      void init;
      return healthyResponse(url);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(assertProductionReadiness()).resolves.toMatchObject({
      dependencies: {
        auth: "ready",
        database: "ready",
        storage: "ready",
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const databaseCall = fetchMock.mock.calls.find(
      ([url]) => new URL(String(url)).pathname === "/rest/v1/learning_modules",
    );
    expect(databaseCall?.[1]?.headers).toMatchObject({
      apikey: REQUIRED_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${REQUIRED_ENV.SUPABASE_SERVICE_ROLE_KEY}`,
    });
  });

  it("classifies a database failure without exposing its payload", async () => {
    stubEnvironment();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL) => {
        if (new URL(String(url)).pathname === "/rest/v1/learning_modules") {
          return Promise.resolve(
            Response.json(
              { message: "sensitive schema detail" },
              { status: 503 },
            ),
          );
        }
        return healthyResponse(url);
      }),
    );

    await expect(assertProductionReadiness()).rejects.toMatchObject({
      name: "DependencyReadinessError",
      dependency: "database",
    });
  });

  it("rejects a malformed database response", async () => {
    stubEnvironment();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL) => {
        if (new URL(String(url)).pathname === "/rest/v1/learning_modules") {
          return Promise.resolve(Response.json({ unexpected: true }));
        }
        return healthyResponse(url);
      }),
    );

    await expect(assertProductionReadiness()).rejects.toBeInstanceOf(
      DependencyReadinessError,
    );
  });

  it("classifies a timeout as dependency unavailable", async () => {
    stubEnvironment();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string | URL) => {
        if (
          new URL(String(url)).pathname ===
          "/storage/v1/bucket/speaking-recordings"
        ) {
          return Promise.reject(new DOMException("timed out", "TimeoutError"));
        }
        return healthyResponse(url);
      }),
    );

    await expect(assertProductionReadiness()).rejects.toMatchObject({
      dependency: "storage",
    });
  });
});
