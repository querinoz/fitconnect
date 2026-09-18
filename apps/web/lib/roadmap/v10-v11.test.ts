import { describe, expect, it, beforeEach } from "vitest";
import { routeAgentQuery } from "@/lib/ai/agent-router";
import {
  coachMayAccessAthlete,
  upsertCoachAthleteLink,
  revokeCoachAthleteLink,
  __resetCoachRosterAcl
} from "@/lib/coach/roster-acl";
import {
  createSpot,
  getVisibleSpot,
  listPublicSpots,
  __resetSportsNetwork
} from "@/lib/social/sports-network";
import { periodizeNutritionDay } from "@/lib/nutrition/periodization";
import { recommendSessionAdaptation } from "@/lib/sports-intelligence/adaptive-training";
import { computeTrainingLoad } from "@/lib/sports-intelligence/training-load";
import type { NutritionProfile } from "@/lib/nutrition/types";

describe("V10.4 agent router", () => {
  it("routes nutrition queries", () => {
    const r = routeAgentQuery("What should I eat after my long run?");
    expect(r.agent).toBe("NUTRITION");
    expect(r.suggestedTools).toContain("get_nutrition_targets");
  });

  it("routes training queries", () => {
    const r = routeAgentQuery("Should I deload this week?");
    expect(r.agent).toBe("TRAINING");
  });
});

describe("V10.5 coach roster ACL", () => {
  beforeEach(() => __resetCoachRosterAcl());

  it("denies cross-tenant by default", () => {
    const access = coachMayAccessAthlete({
      coachId: "coach1",
      athleteId: "ath1",
      scope: "training"
    });
    expect(access.ok).toBe(false);
  });

  it("allows linked scope and denies others", () => {
    upsertCoachAthleteLink({
      coachId: "coach1",
      athleteId: "ath1",
      scopes: ["training", "recovery"],
      active: true,
      revokedAt: null
    });
    expect(
      coachMayAccessAthlete({ coachId: "coach1", athleteId: "ath1", scope: "training" }).ok
    ).toBe(true);
    expect(
      coachMayAccessAthlete({ coachId: "coach1", athleteId: "ath1", scope: "nutrition" }).ok
    ).toBe(false);
    revokeCoachAthleteLink("coach1", "ath1");
    expect(
      coachMayAccessAthlete({ coachId: "coach1", athleteId: "ath1", scope: "training" }).ok
    ).toBe(false);
  });
});

describe("V11 sports network privacy", () => {
  beforeEach(() => __resetSportsNetwork());

  it("never exposes exact coords on public list", () => {
    createSpot({
      spotId: "s1",
      name: "Hill loop",
      sport: "RUNNING",
      visibility: "public",
      ownerId: "u1",
      approxLat: 38.7,
      approxLng: -9.1,
      exactLat: 38.7223,
      exactLng: -9.1393,
      difficulty: "moderate",
      surface: "trail",
      hazards: [],
      bestTime: null,
      sharedWith: [],
      dangerFlag: false
    });
    const list = listPublicSpots("RUNNING");
    expect(list[0]!.exactLat).toBeNull();
    expect(list[0]!.exactLng).toBeNull();
  });

  it("keeps secret spots private to owner/shared", () => {
    createSpot({
      spotId: "secret1",
      name: "Hidden",
      sport: "CLIMBING",
      visibility: "secret",
      ownerId: "u1",
      approxLat: null,
      approxLng: null,
      exactLat: 1,
      exactLng: 2,
      difficulty: null,
      surface: null,
      hazards: ["loose rock"],
      bestTime: null,
      sharedWith: ["u2"],
      dangerFlag: true
    });
    expect(getVisibleSpot("secret1", "stranger").spot).toBeNull();
    expect(getVisibleSpot("secret1", "u1").spot?.exactLat).toBe(1);
    expect(getVisibleSpot("secret1", "u2").spot?.dangerFlag).toBe(true);
  });
});

describe("V10.2 / V10.3 engines", () => {
  it("recommends volume cut on SPIKE load", () => {
    const sessions = Array.from({ length: 28 }, (_, i) => {
      const d = new Date("2026-09-18T12:00:00.000Z");
      d.setUTCDate(d.getUTCDate() - i);
      return { dateISO: d.toISOString().slice(0, 10), strain: i < 7 ? 150 : 40 };
    });
    const load = computeTrainingLoad(sessions, new Date("2026-09-18T12:00:00.000Z"));
    const rec = recommendSessionAdaptation({
      trainingLoad: load,
      readinessScore: 70,
      readinessState: "MEDIUM",
      availableMin: 60,
      plannedDurationMin: 60
    });
    expect(rec.autoApplied).toBe(false);
    expect(rec.requiresConfirm).toBe(true);
    expect(["REDUCE_VOLUME", "SWAP_TO_RECOVERY", "DELOAD_SUGGEST"]).toContain(rec.action);
  });

  it("periodizes nutrition with hydration caution", () => {
    const profile: NutritionProfile = {
      userId: "u1",
      goal: "PERFORMANCE",
      dietPattern: null,
      allergies: [],
      intolerances: [],
      dislikes: [],
      religiousRestrictions: [],
      mealFrequency: 4,
      countryLocale: "pt-PT",
      highRiskContext: false,
      declaredMedicalContext: false
    };
    const plan = periodizeNutritionDay({
      profile,
      sportNutritionKey: "endurance",
      dayKind: "long",
      bodyMassKg: 70,
      sessionDurationMin: 120
    });
    expect(plan.targets.estimateKind).toBe("ESTIMATE");
    expect(plan.hydrationContext.caution.toLowerCase()).toContain("weight cutting");
    expect(plan.fuelingWindows.some((w) => w.slot === "during")).toBe(true);
  });
});
