import { describe, expect, it, vi } from "vitest";
import { handleStravaV3Proxy } from "./proxy-handler";

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

vi.mock("./route-auth", () => ({
  resolveIntegrationAthlete: async () => ({ athleteId: "user-a" })
}));

vi.mock("./service", () => ({
  getConnectionByAthlete: async () => ({ deauthorizedAt: null }),
  createStravaClientForAthlete: () => null
}));

describe("strava v3 proxy allowlist", () => {
  it("returns 403 for banned third-party paths", async () => {
    const response = await handleStravaV3Proxy(
      new Request("http://localhost/api/v1/integrations/strava/v3/segments/explore"),
      ["segments", "explore"]
    );
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("endpoint_forbidden");
  });
});
