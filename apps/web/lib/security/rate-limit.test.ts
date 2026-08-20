import { describe, expect, it } from "vitest";
import { enforceRateLimit } from "./rate-limit";
import { isProductionSecurityMode } from "./runtime";

describe("production rate limit", () => {
  it("fails closed in production without Upstash", async () => {
    expect(
      isProductionSecurityMode({
        NODE_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "false"
      } as NodeJS.ProcessEnv)
    ).toBe(true);

    const response = await enforceRateLimit(
      new Request("http://localhost/api/v1/leads"),
      "leads",
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_DEMO_MODE: "false"
      } as NodeJS.ProcessEnv
    );
    expect(response?.status).toBe(503);
  });

  it("skips in explicit LOCAL_DEMO", async () => {
    const response = await enforceRateLimit(
      new Request("http://localhost/api/v1/leads"),
      "leads",
      { NODE_ENV: "test", NEXT_PUBLIC_DEMO_MODE: "true" } as NodeJS.ProcessEnv
    );
    expect(response).toBeNull();
  });
});
