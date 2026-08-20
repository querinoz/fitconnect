import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "@/app/api/v1/integrations/strava/webhook/route";

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

vi.mock("@/lib/integrations/strava/service", () => ({
  getConnectionByStravaAthleteId: vi.fn()
}));

describe("strava webhook fail-closed", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    vi.stubEnv("STRAVA_WEBHOOK_VERIFY_TOKEN", "");
    vi.stubEnv("QSTASH_TOKEN", "");
    vi.stubEnv("INTEGRATION_AUTH_SECRET", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 when verify token is missing", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/integrations/strava/webhook?hub.mode=subscribe&hub.verify_token=x&hub.challenge=c")
    );
    expect(response.status).toBe(503);
  });

  it("rejects a wrong challenge token", async () => {
    vi.stubEnv("STRAVA_WEBHOOK_VERIFY_TOKEN", "expected");
    const response = await GET(
      new Request(
        "http://localhost/api/v1/integrations/strava/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=c"
      )
    );
    expect(response.status).toBe(403);
  });

  it("accepts a valid challenge", async () => {
    vi.stubEnv("STRAVA_WEBHOOK_VERIFY_TOKEN", "expected");
    const response = await GET(
      new Request(
        "http://localhost/api/v1/integrations/strava/webhook?hub.mode=subscribe&hub.verify_token=expected&hub.challenge=abc"
      )
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ "hub.challenge": "abc" });
  });

  it("does not enqueue unsigned jobs in production", async () => {
    vi.stubEnv("STRAVA_WEBHOOK_VERIFY_TOKEN", "expected");
    const { getConnectionByStravaAthleteId } = await import("@/lib/integrations/strava/service");
    vi.mocked(getConnectionByStravaAthleteId).mockResolvedValue({
      athleteExternalId: "user-a",
      deauthorizedAt: null
    } as never);
    const response = await POST(
      new Request("http://localhost/api/v1/integrations/strava/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_type: "activity",
          object_id: 1,
          aspect_type: "create",
          owner_id: 9,
          subscription_id: 1,
          event_time: 1
        })
      })
    );
    expect(response.status).toBe(503);
  });

  it("rejects invalid POST bodies", async () => {
    vi.stubEnv("STRAVA_WEBHOOK_VERIFY_TOKEN", "expected");
    const response = await POST(
      new Request("http://localhost/api/v1/integrations/strava/webhook", {
        method: "POST",
        body: "not-json"
      })
    );
    expect(response.status).toBe(400);
  });
});
