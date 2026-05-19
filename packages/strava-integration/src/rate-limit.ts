import type { StravaRateLimit } from "@fitconnect/types";

export class StravaRateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number,
    public readonly limits: StravaRateLimit
  ) {
    super(message);
    this.name = "StravaRateLimitError";
  }
}

export function parseRateLimitHeaders(headers: Headers): StravaRateLimit {
  const usage = headers.get("X-RateLimit-Usage")?.split(",") ?? ["0", "0"];
  const limit = headers.get("X-RateLimit-Limit")?.split(",") ?? ["100", "1000"];
  return {
    fifteenMinUsage: Number(usage[0]) || 0,
    dailyUsage: Number(usage[1]) || 0,
    fifteenMinLimit: Number(limit[0]) || 100,
    dailyLimit: Number(limit[1]) || 1000
  };
}

export function isRateLimited(limits: StravaRateLimit): boolean {
  return (
    limits.fifteenMinUsage >= limits.fifteenMinLimit ||
    limits.dailyUsage >= limits.dailyLimit
  );
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Exponential backoff for 429 responses. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (e instanceof StravaRateLimitError) {
        const delay = e.retryAfterMs || baseDelayMs * Math.pow(2, attempt);
        await sleep(Math.min(delay, 60_000));
        continue;
      }
      throw e;
    }
  }

  throw lastError;
}
