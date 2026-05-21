import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createLimiter(requests: number, window: `${number} s` | `${number} m`) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true
  });
}

export const leadsLimiter = createLimiter(10, "60 s");
export const authLimiter = createLimiter(20, "60 s");
export const ingestionLimiter = createLimiter(30, "60 s");

export async function rateLimitOrNull(
  limiter: Ratelimit | null,
  key: string
): Promise<{ success: boolean; limit?: number; remaining?: number }> {
  if (!limiter) return { success: true };
  const result = await limiter.limit(key);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining
  };
}
