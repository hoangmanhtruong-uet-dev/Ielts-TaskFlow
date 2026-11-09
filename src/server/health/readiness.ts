import "server-only";

import {
  getPublicEnv,
  getServerEnv,
  inspectOptionalAiConfiguration,
} from "@/lib/env";

export class DependencyReadinessError extends Error {
  constructor(
    public readonly dependency: "auth" | "database" | "storage",
    options?: ErrorOptions,
  ) {
    super("A required Supabase dependency is unavailable.", options);
    this.name = "DependencyReadinessError";
  }
}

const DEPENDENCY_TIMEOUT_MS = 3_000;

export async function assertProductionReadiness() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();
  const optionalAi = inspectOptionalAiConfiguration(serverEnv);

  await Promise.all([
    checkAuth(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    checkDatabase(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    checkStorage(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY!,
    ),
  ]);

  return {
    optionalAi,
    dependencies: {
      auth: "ready" as const,
      database: "ready" as const,
      storage: "ready" as const,
    },
  };
}

async function checkAuth(baseUrl: string, anonKey: string) {
  const response = await dependencyFetch(
    "auth",
    new URL("/auth/v1/health", baseUrl),
    { headers: { apikey: anonKey } },
  );
  if (!response.ok) throw new DependencyReadinessError("auth");
}

async function checkDatabase(baseUrl: string, anonKey: string) {
  const url = new URL("/rest/v1/learning_modules", baseUrl);
  url.searchParams.set("select", "id");
  url.searchParams.set("limit", "0");
  const response = await dependencyFetch("database", url, {
    headers: { apikey: anonKey },
  });
  if (!response.ok) throw new DependencyReadinessError("database");
  try {
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error("malformed_database_response");
  } catch (error) {
    throw new DependencyReadinessError("database", { cause: error });
  }
}

async function checkStorage(
  baseUrl: string,
  anonKey: string,
  serviceRoleKey: string,
) {
  const response = await dependencyFetch(
    "storage",
    new URL("/storage/v1/bucket/speaking-recordings", baseUrl),
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!response.ok) throw new DependencyReadinessError("storage");
  try {
    const body: unknown = await response.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("id" in body) ||
      body.id !== "speaking-recordings" ||
      !("public" in body) ||
      body.public !== false
    ) {
      throw new Error("malformed_or_public_storage_bucket");
    }
  } catch (error) {
    throw new DependencyReadinessError("storage", { cause: error });
  }
}

async function dependencyFetch(
  dependency: "auth" | "database" | "storage",
  url: URL,
  init: RequestInit,
) {
  try {
    return await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(DEPENDENCY_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof DependencyReadinessError) throw error;
    throw new DependencyReadinessError(dependency, { cause: error });
  }
}
