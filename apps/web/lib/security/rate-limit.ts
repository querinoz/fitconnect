import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export type RateLimitBucket =
  | "auth"
  | "identity"
  | "leads"
  | "webhook"
  | "ingestion"
  | "strava"
  | "account-delete"
  | "highcost";

export const RATE_LIMIT_POLICY: Record<
  RateLimitBucket,
  { limit: number; window: `${number} ${"s" | "m" | "h"}`; scope: string }
> = {
  auth: { limit: 20, window: "1 m", scope: "ip" },
  identity: { limit: 60, window: "1 m", scope: "ip+user" },
  leads: { limit: 5, window: "1 m", scope: "ip" },
  webhook: { limit: 60, window: "1 m", scope: "ip" },
  ingestion: { limit: 30, window: "1 m", scope: "ip" },
  strava: { limit: 30, window: "1 m", scope: "ip+user" },
  "account-delete": { limit: 5, window: "1 h", scope: "ip+user" },
  highcost: { limit: 20, window: "1 m", scope: "ip+user" }
};

export type RateLimitBackend = "upstash" | "memory" | "skipped";

function redisFromEnv(env: NodeJS.ProcessEnv = process.env): Redis | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token || url.includes("PASTE_") || token.includes("PASTE_")) {
    return null;
  }
  return new Redis({ url, token });
}

export function resolveRateLimitBackend(env: NodeJS.ProcessEnv = process.env): RateLimitBackend {
  if (env.NEXT_PUBLIC_DEMO_MODE === "true") return "skipped";
  return redisFromEnv(env) ? "upstash" : "memory";
}

const limiters = new Map<RateLimitBucket, Ratelimit>();

function limiterFor(bucket: RateLimitBucket, env: NodeJS.ProcessEnv): Ratelimit | null {
  const redis = redisFromEnv(env);
  if (!redis) return null;
  const existing = limiters.get(bucket);
  if (existing) return existing;
  const policy = RATE_LIMIT_POLICY[bucket];
  const created = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: `fc:${bucket}`
  });
  limiters.set(bucket, created);
  return created;
}

function parseWindowMs(window: `${number} ${"s" | "m" | "h"}`): number {
  const [raw, unit] = window.split(" ") as [string, "s" | "m" | "h"];
  const n = Number(raw);
  if (unit === "s") return n * 1000;
  if (unit === "h") return n * 3_600_000;
  return n * 60_000;
}

const memoryHits = new Map<string, number[]>();

export function resetMemoryRateLimitForTests() {
  memoryHits.clear();
}

function enforceMemoryLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): { success: boolean; reset: number } {
  const prior = memoryHits.get(key) ?? [];
  const recent = prior.filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    memoryHits.set(key, recent);
    return { success: false, reset: (recent[0] ?? now) + windowMs };
  }
  recent.push(now);
  if (memoryHits.size > 20_000) {
    memoryHits.clear();
  }
  memoryHits.set(key, recent);
  return { success: true, reset: now + windowMs };
}

function clientKey(request: Request, bucket: RateLimitBucket): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const user =
    request.headers.get("x-athlete-id") ||
    request.headers.get("authorization")?.slice(0, 24) ||
    "anon";
  const scope = RATE_LIMIT_POLICY[bucket].scope;
  return scope.includes("user") ? `${ip}:${user}` : ip;
}

/**
 * Enforce a sliding-window limit.
 * Demo skips. Production uses Upstash when configured, otherwise an in-process
 * window (real limit, not distributed). Never 503s identity/auth because Redis
 * is unset — health reports the backend honestly.
 */
export async function enforceRateLimit(
  request: Request,
  bucket: RateLimitBucket,
  env: NodeJS.ProcessEnv = process.env
): Promise<NextResponse | null> {
  if (env.NEXT_PUBLIC_DEMO_MODE === "true") return null;

  const key = clientKey(request, bucket);
  const policy = RATE_LIMIT_POLICY[bucket];
  const limiter = limiterFor(bucket, env);
  const windowMs = parseWindowMs(policy.window);

  let result: { success: boolean; reset: number; limit?: number; remaining?: number };
  try {
    result = limiter
      ? await limiter.limit(key)
      : enforceMemoryLimit(`${bucket}:${key}`, policy.limit, windowMs);
  } catch {
    // Upstash outage must not 503 identity/auth. Fall back to in-process window.
    result = enforceMemoryLimit(`${bucket}:${key}`, policy.limit, windowMs);
  }

  if (result.success) return null;
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  const remaining = result.remaining ?? 0;
  const limit = result.limit ?? policy.limit;
  return NextResponse.json(
    { error: "rate_limited", bucket, retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(Math.max(0, remaining)),
        "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000))
      }
    }
  );
}
