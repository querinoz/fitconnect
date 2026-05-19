import type { StravaRateLimit } from "@fitconnect/types";

const globalCache = globalThis as typeof globalThis & {
  __fcStravaRateLimit?: StravaRateLimit | null;
};

export function setStravaRateLimit(limits: StravaRateLimit | null) {
  globalCache.__fcStravaRateLimit = limits;
}

export function getStravaRateLimit(): StravaRateLimit | null {
  return globalCache.__fcStravaRateLimit ?? null;
}
