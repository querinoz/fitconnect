import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { isProductionSecurityMode } from "./runtime";

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

function redisFromEnv(env: NodeJS.ProcessEnv = process.env): Redis | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
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

export async function enforceRateLimit(
  request: Request,
  bucket: RateLimitBucket,
  env: NodeJS.ProcessEnv = process.env
): Promise<NextResponse | null> {
  if (env.NEXT_PUBLIC_DEMO_MODE === "true") return null;

  const limiter = limiterFor(bucket, env);
  if (!limiter) {
    if (isProductionSecurityMode(env)) {
      return NextResponse.json(
        { error: "rate_limit_not_configured" },
        { status: 503 }
      );
    }
    return null;
  }

  const { success, reset } = await limiter.limit(clientKey(request, bucket));
  if (success) return null;
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "rate_limited", bucket, retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
