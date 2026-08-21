import { describe, expect, it } from "vitest";
import { stravaRevocationPurgePlan } from "./service";

describe("Strava GDPR purge", () => {
  it("deletes tokens and derived activity rows", () => {
    const plan = stravaRevocationPurgePlan("ath-1");
    expect(plan.deleteActivities).toBe(true);
    expect(plan.deleteLaps).toBe(true);
    expect(plan.deleteSegmentEfforts).toBe(true);
    expect(plan.deleteConnectionAndTokens).toBe(true);
  });
});
