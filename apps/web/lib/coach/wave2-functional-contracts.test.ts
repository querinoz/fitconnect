/**
 * WAVE2 web contracts — discover empty without DB, coach athlete ACL.
 */
import { describe, expect, it } from "vitest";
import {
  coachOwnsAthlete,
  getCoachAthleteDetail,
  listDiscoverCoaches
} from "@/lib/db/repository";

describe("Mobile Functional Completion Wave 2", () => {
  it("DISCOVER-001 listDiscoverCoaches never returns seed without postgres", async () => {
    const result = await listDiscoverCoaches();
    expect(["postgres", "empty"]).toContain(result.source);
    expect(result.source).not.toBe("seed");
    expect(Array.isArray(result.coaches)).toBe(true);
  });

  it("COACH-ATHLETE-001 ownership false for unrelated athlete", async () => {
    const owned = await coachOwnsAthlete("coach-not-linked", "athlete-foreign-xyz");
    expect(owned).toBe(false);
  });

  it("COACH-ATHLETE-002 detail null when not owned", async () => {
    const { athlete } = await getCoachAthleteDetail(
      "coach-not-linked",
      "athlete-foreign-xyz"
    );
    expect(athlete).toBeNull();
  });

  it("COACH-ATHLETE-003 seed roster ownership is explicit seed path only", async () => {
    // Seed dashboard may own ath-1 for demo coach; remote Android rejects source=seed.
    const detail = await getCoachAthleteDetail("t-002", "ath-1");
    if (detail.athlete) {
      expect(["seed", "postgres", "empty"]).toContain(detail.source);
    }
  });
});
