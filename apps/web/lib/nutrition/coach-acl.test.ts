import { describe, expect, it, beforeEach } from "vitest";
import { coachMayReadNutrition } from "./coach-acl";
import {
  upsertNutritionProfile,
  __resetNutritionPersistenceMemory
} from "./nutrition-repository";

describe("coach nutrition ACL", () => {
  beforeEach(() => {
    __resetNutritionPersistenceMemory();
  });

  it("denies by default even when coach is authorized for athlete", async () => {
    await upsertNutritionProfile("ath-1", { goal: "PERFORMANCE", shareWithCoach: false });
    const res = await coachMayReadNutrition({
      coachUserId: "coach-1",
      athleteUserId: "ath-1",
      coachAuthorizedForAthlete: true
    });
    expect(res.allowed).toBe(false);
    expect(res.logs).toHaveLength(0);
  });

  it("allows when athlete opts in", async () => {
    await upsertNutritionProfile("ath-1", { goal: "PERFORMANCE", shareWithCoach: true });
    const res = await coachMayReadNutrition({
      coachUserId: "coach-1",
      athleteUserId: "ath-1",
      coachAuthorizedForAthlete: true
    });
    expect(res.allowed).toBe(true);
    expect(res.profile?.goal).toBe("PERFORMANCE");
  });

  it("denies when coach not authorized", async () => {
    await upsertNutritionProfile("ath-1", { shareWithCoach: true });
    const res = await coachMayReadNutrition({
      coachUserId: "coach-1",
      athleteUserId: "ath-1",
      coachAuthorizedForAthlete: false
    });
    expect(res.allowed).toBe(false);
  });
});
