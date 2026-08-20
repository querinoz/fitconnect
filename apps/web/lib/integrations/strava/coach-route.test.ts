import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/v1/integrations/strava/coach/route";

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: async () => null
}));

describe("Strava coach route", () => {
  it("never returns athlete Strava activities to a coach", async () => {
    const response = await GET(
      new Request("http://localhost/api/v1/integrations/strava/coach")
    );
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("strava_not_shareable");
    expect(body.activities).toEqual([]);
  });
});
