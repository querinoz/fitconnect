import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/v1/readiness/compute/route";

describe("POST /api/v1/readiness/compute", () => {
  it("should_return_score_between_0_and_100", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/readiness/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrvMs: 68, sleepHours: 8, strainScore: 20 })
      })
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
    expect(["optimal", "good", "moderate", "poor"]).toContain(body.status);
  });

  it("should_return_422_for_invalid_body", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/readiness/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
    );
    expect(res.status).toBe(422);
  });

  it("should_clamp_hrv_zero_without_negative_score", async () => {
    const res = await POST(
      new Request("http://localhost/api/v1/readiness/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrvMs: 0, strainScore: 0 })
      })
    );
    const body = await res.json();
    expect(body.score).toBeGreaterThanOrEqual(0);
  });
});
