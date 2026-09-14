import { describe, expect, it, beforeEach } from "vitest";
import {
  enforceRateLimit,
  resetMemoryRateLimitForTests,
  resolveRateLimitBackend
} from "./rate-limit";
import { isProductionSecurityMode } from "./runtime";

describe("production rate limit", () => {
  beforeEach(() => {
    resetMemoryRateLimitForTests();
  });

  it("uses in-memory limiting in production without Upstash (never 503)", async () => {
    expect(
      isProductionSecurityMode({
        NODE_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "false"
      } as NodeJS.ProcessEnv)
    ).toBe(true);

    expect(
      resolveRateLimitBackend({
        NODE_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "false"
      } as NodeJS.ProcessEnv)
    ).toBe("memory");

    const env = {
      NODE_ENV: "production",
      NEXT_PUBLIC_DEMO_MODE: "false"
    } as NodeJS.ProcessEnv;

    for (let i = 0; i < 5; i++) {
      const allowed = await enforceRateLimit(
        new Request("http://localhost/api/v1/leads"),
        "leads",
        env
      );
      expect(allowed).toBeNull();
    }

    const blocked = await enforceRateLimit(
      new Request("http://localhost/api/v1/leads"),
      "leads",
      env
    );
    expect(blocked?.status).toBe(429);
    const body = (await blocked?.json()) as { error?: string };
    expect(body.error).toBe("rate_limited");
  });

  it("reports upstash when redis env is set", () => {
    expect(
      resolveRateLimitBackend({
        NEXT_PUBLIC_DEMO_MODE: "false",
        UPSTASH_REDIS_REST_URL: "https://redis.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token"
      } as unknown as NodeJS.ProcessEnv)
    ).toBe("upstash");
  });

  it("skips in explicit LOCAL_DEMO", async () => {
    const response = await enforceRateLimit(
      new Request("http://localhost/api/v1/leads"),
      "leads",
      { NODE_ENV: "test", NEXT_PUBLIC_DEMO_MODE: "true" } as NodeJS.ProcessEnv
    );
    expect(response).toBeNull();
    expect(
      resolveRateLimitBackend({ NEXT_PUBLIC_DEMO_MODE: "true" } as unknown as NodeJS.ProcessEnv)
    ).toBe("skipped");
  });
});
