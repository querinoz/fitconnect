import { describe, expect, it } from "vitest";
import { recoveryFromReadinessPayload } from "./from-readiness";

describe("recoveryFromReadinessPayload", () => {
  it("does not invent HRV or sleep when the API has no telemetry", () => {
    const view = recoveryFromReadinessPayload({ score: null, source: "insufficient_data" });
    expect(view.readiness.available).toBe(false);
    expect(view.observations.hrvMs.value).toBeNull();
    expect(view.observations.sleepHours.confidence).toBe("missing");
    expect(view.whatHappened.toLowerCase()).toMatch(/no recovery telemetry/);
    expect(view.whatToDo.toLowerCase()).toMatch(/connect|catalog/);
  });

  it("labels a Strava-derived score as derived, not a measured HRV", () => {
    const view = recoveryFromReadinessPayload({ score: 72, source: "strava", provider: "STRAVA" });
    expect(view.readiness.available).toBe(true);
    expect(view.observations.readinessScore.confidence).toBe("derived");
    expect(view.observations.hrvMs.value).toBeNull();
    expect(view.whatItMeans).toMatch(/Feed/);
  });
});
