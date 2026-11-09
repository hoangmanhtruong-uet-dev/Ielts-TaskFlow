import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

const isUpstashConfigured =
  Boolean(upstashUrl) &&
  !upstashUrl.includes("dummy") &&
  Boolean(upstashToken) &&
  !upstashToken.includes("dummy");

const realRedis = isUpstashConfigured
  ? new Redis({
      url: upstashUrl,
      token: upstashToken,
    })
  : null;

const MAX_MEMORY_ENTRIES = 5_000;
let loggedMissingRedisInProd = false;

type MemoryBucket = {
  count: number;
  resetAt: number;
};

function createFallbackLimiter(
  name: string,
  maxRequests: number,
  windowMs: number,
): Ratelimit {
  const store = new Map<string, MemoryBucket>();

  function evictIfNeeded(now: number) {
    if (store.size < MAX_MEMORY_ENTRIES) return;
    for (const [key, bucket] of store.entries()) {
      if (bucket.resetAt <= now) {
        store.delete(key);
      }
    }
    while (store.size >= MAX_MEMORY_ENTRIES) {
      const oldestKey = store.keys().next().value;
      if (oldestKey === undefined) break;
      store.delete(oldestKey);
    }
  }

  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const isProduction = process.env.NODE_ENV === "production";

      // In local dev / test without Redis, keep developer ergonomics smooth unless production mode is active.
      if (!isProduction && process.env.ENFORCE_MEMORY_RATE_LIMIT !== "true") {
        return {
          success: true,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - 1),
          reset: now + windowMs,
          pending: Promise.resolve(),
        };
      }

      if (isProduction && !loggedMissingRedisInProd) {
        loggedMissingRedisInProd = true;
        console.error(
          JSON.stringify({
            level: "error",
            event: "UPSTASH_REDIS_MISSING_IN_PROD",
            message:
              "Upstash Redis is not configured in production; using bounded per-instance fallback rate limiter.",
            limiter: name,
          }),
        );
      }

      const key = `${name}:${identifier}`;
      const existing = store.get(key);

      if (!existing || existing.resetAt <= now) {
        evictIfNeeded(now);
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return {
          success: true,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - 1),
          reset: resetAt,
          pending: Promise.resolve(),
        };
      }

      if (existing.count >= maxRequests) {
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: existing.resetAt,
          pending: Promise.resolve(),
        };
      }

      existing.count += 1;
      store.delete(key);
      store.set(key, existing);

      return {
        success: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - existing.count),
        reset: existing.resetAt,
        pending: Promise.resolve(),
      };
    },
  } as unknown as Ratelimit;
}

function buildRateLimiter(
  name: string,
  maxRequests: number,
  windowText: Parameters<typeof Ratelimit.slidingWindow>[1],
  windowMs: number,
): Ratelimit {
  const fallback = createFallbackLimiter(name, maxRequests, windowMs);
  if (!realRedis) {
    return fallback;
  }

  const upstash = new Ratelimit({
    redis: realRedis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowText),
    prefix: `indigoscholar:${name}`,
    analytics: true,
  });

  return {
    limit: async (identifier: string) => {
      try {
        return await upstash.limit(identifier);
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            event: "RATE_LIMIT_REDIS_FALLBACK",
            limiter: name,
            message: error instanceof Error ? error.message : "unknown_error",
          }),
        );
        return fallback.limit(identifier);
      }
    },
  } as unknown as Ratelimit;
}

export const ipRateLimit: Ratelimit = buildRateLimiter("ip", 60, "1 m", 60_000);

export const userFreeDailyQuota: Ratelimit = buildRateLimiter(
  "free-daily",
  2,
  "1 d",
  86_400_000,
);

export const saveDraftRateLimit: Ratelimit = buildRateLimiter(
  "save-draft",
  30,
  "1 m",
  60_000,
);

export const submitAttemptRateLimit: Ratelimit = buildRateLimiter(
  "submit-attempt",
  5,
  "1 m",
  60_000,
);

export const mediaRateLimit: Ratelimit = buildRateLimiter(
  "media-duration",
  20,
  "1 m",
  60_000,
);

export const cmsImportRateLimit: Ratelimit = buildRateLimiter(
  "cms-import",
  10,
  "1 m",
  60_000,
);

export const webhookRateLimit: Ratelimit = buildRateLimiter(
  "billing-webhook",
  60,
  "1 m",
  60_000,
);

export const dictationSubmitRateLimit: Ratelimit = buildRateLimiter(
  "dictation-submit",
  30,
  "1 m",
  60_000,
);

export const dictionaryRateLimit: Ratelimit = buildRateLimiter(
  "dictionary-lookup",
  30,
  "1 m",
  60_000,
);
