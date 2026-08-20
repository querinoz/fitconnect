import { describe, expect, it } from "vitest";
import {
  canEnqueueStravaSyncJob,
  stravaWebhookVerifyToken
} from "./webhook-secrets";

describe("strava webhook secrets", () => {
  it("rejects missing and placeholder verify tokens", () => {
    expect(stravaWebhookVerifyToken({} as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(
      stravaWebhookVerifyToken({ STRAVA_WEBHOOK_VERIFY_TOKEN: "fitconnect-dev" } as unknown as NodeJS.ProcessEnv)
    ).toBeNull();
    expect(
      stravaWebhookVerifyToken({ STRAVA_WEBHOOK_VERIFY_TOKEN: "real-verify-token" } as unknown as NodeJS.ProcessEnv)
    ).toBe("real-verify-token");
  });

  it("fails closed in production without QStash", () => {
    const result = canEnqueueStravaSyncJob({
      NODE_ENV: "production",
      NEXT_PUBLIC_DEMO_MODE: "false"
    } as NodeJS.ProcessEnv);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("qstash_required");
  });

  it("fails closed in production when QStash exists but job secret is missing", () => {
    const result = canEnqueueStravaSyncJob({
      NODE_ENV: "production",
      NEXT_PUBLIC_DEMO_MODE: "false",
      QSTASH_TOKEN: "qstash-token"
    } as NodeJS.ProcessEnv);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("job_secret_required");
  });

  it("allows local enqueue only with a real job secret", () => {
    const denied = canEnqueueStravaSyncJob({
      NODE_ENV: "development",
      NEXT_PUBLIC_DEMO_MODE: "false"
    } as NodeJS.ProcessEnv);
    expect(denied.ok).toBe(false);

    const allowed = canEnqueueStravaSyncJob({
      NODE_ENV: "development",
      NEXT_PUBLIC_DEMO_MODE: "false",
      INTEGRATION_AUTH_SECRET: "local-job-secret"
    } as NodeJS.ProcessEnv);
    expect(allowed).toEqual({ ok: true, mode: "local-secret" });
  });
});
