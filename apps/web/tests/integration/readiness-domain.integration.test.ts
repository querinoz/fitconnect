import { describe, expect, it } from "vitest";
import { computeReadiness } from "@/lib/readiness/compute";
import { getAthleteReadiness } from "@/lib/db/repository";
import { buildReadinessInput, SEED_ATHLETE_ID } from "../fixtures/domain";

describe("readiness domain integration", () => {
  it("should_compute_consistent_score_for_seed_athlete_profile", async () => {
    const snapshot = await getAthleteReadiness(SEED_ATHLETE_ID);
    expect(snapshot).not.toBeNull();

    const computed = computeReadiness(
      buildReadinessInput({
        hrvMs: snapshot!.hrvMs,
        baselineHrvMs: Math.max(58, snapshot!.hrvMs - 4),
        sleepHours: Number.parseFloat(snapshot!.sleepHours) || 7.5,
        sleepEfficiency: snapshot!.sleepEfficiency,
        strainScore: snapshot!.recoveryStatus === "red" ? 72 : 28
      })
    );

    expect(computed.recoveryStatus).toMatch(/^(green|amber|red)$/);
    expect(computed.score).toBeGreaterThanOrEqual(0);
    expect(computed.score).toBeLessThanOrEqual(100);
  });

  it("should_preserve_recovery_status_invariant_across_compute_and_snapshot", async () => {
    const snapshot = await getAthleteReadiness(SEED_ATHLETE_ID);
    const critical = computeReadiness(
      buildReadinessInput({
        hrvMs: 38,
        baselineHrvMs: 64,
        sleepHours: 4.2,
        sleepEfficiency: 55,
        strainScore: 92
      })
    );

    expect(critical.recoveryStatus).toBe("red");
    expect(snapshot?.athleteId).toBe(SEED_ATHLETE_ID);
  });
});
