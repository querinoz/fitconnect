import { describe, expect, it } from "vitest";
import { isRateLimited, parseRateLimitHeaders } from "./rate-limit";

describe("Strava 85% rate limit brake", () => {
  it("trips before a 429", () => {
    const limits = parseRateLimitHeaders(
      new Headers({
        "X-RateLimit-Usage": "85,10",
        "X-RateLimit-Limit": "100,1000"
      })
    );
    expect(isRateLimited(limits)).toBe(true);
    expect(
      isRateLimited({
        fifteenMinUsage: 84,
        fifteenMinLimit: 100,
        dailyUsage: 10,
        dailyLimit: 1000
      })
    ).toBe(false);
  });
});
