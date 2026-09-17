import { describe, expect, it, beforeEach } from "vitest";
import {
  upsertSportsIdentity,
  readSportsIdentity,
  __resetSportsIdentityMemory
} from "./identity-repository";
import {
  saveTrainingCompletion,
  listTrainingCompletions,
  __resetTrainingCompletionMemory
} from "./completion-repository";
import { adaptTodaySession } from "./adaptation-engine";
import { emptySportsIdentity } from "./sports-identity";
import { getSport, listSports, type SportId } from "./sport-registry";
import { planDailyTargets } from "@/lib/nutrition/planning-engine";
import { generateWeeklyMealPlan } from "@/lib/nutrition/meal-planner";
import { suggestMealSwaps, applyMealSwap } from "@/lib/nutrition/meal-swap";
import { buildGroceryList } from "@/lib/nutrition/grocery";
import {
  upsertNutritionProfile,
  __resetNutritionPersistenceMemory
} from "@/lib/nutrition/nutrition-repository";
import { logFoodConfirmed, __resetNutritionDiaryForTests } from "@/lib/nutrition/diary";

const MULTI: SportId[] = [
  "RUNNING",
  "CYCLING",
  "SWIMMING",
  "FOOTBALL",
  "BASKETBALL",
  "TENNIS",
  "PADEL",
  "STRENGTH",
  "BODYBUILDING",
  "POWERLIFTING",
  "TRIATHLON",
  "HIIT",
  "CROSSFIT",
  "BOXING",
  "MMA"
];

describe("multi-sport session differentiation", () => {
  it("changes structure, metrics, and nutrition key across sports", () => {
    const signatures = new Map<string, string>();
    for (const sportId of MULTI) {
      const profile = emptySportsIdentity("athlete-1");
      profile.primarySport = sportId;
      profile.primaryGoal = "PERFORMANCE";
      const card = adaptTodaySession({
        profile,
        readiness: {
          score: 70,
          band: "READY",
          source: "health_connect",
          available: true,
          detail: "ok"
        },
        recentPlanIds: []
      });
      const sport = getSport(sportId);
      expect(card.sportId).toBe(sportId);
      expect(card.session.blocks.length).toBeGreaterThan(0);
      expect(sport.primaryMetrics.length).toBeGreaterThan(0);
      const sig = [
        card.session.sessionType,
        card.session.blocks.map((b) => b.kind).join(">"),
        sport.primaryMetrics.join(","),
        sport.nutritionProfileKey,
        sport.progressionStrategy
      ].join("|");
      signatures.set(sportId, sig);
      const targets = planDailyTargets({
        profile: {
          userId: "athlete-1",
          goal: "PERFORMANCE",
          dietPattern: null,
          allergies: [],
          intolerances: [],
          dislikes: [],
          religiousRestrictions: [],
          mealFrequency: 3,
          countryLocale: "pt-PT",
          highRiskContext: false,
          declaredMedicalContext: false
        },
        sportNutritionKey: sport.nutritionProfileKey,
        trainingDayKind: "hard",
        bodyMassKg: 70,
        sessionDurationMin: card.session.durationMin
      });
      expect(targets.estimateKind).toBe("ESTIMATE");
      expect(card.fuelingHint.length).toBeGreaterThan(5);
    }
    // Not every pair must differ, but endurance vs strength vs combat must not collapse
    expect(signatures.get("RUNNING")).not.toBe(signatures.get("STRENGTH"));
    expect(signatures.get("BOXING")).not.toBe(signatures.get("RUNNING"));
    expect(signatures.get("CYCLING")).not.toBe(signatures.get("FOOTBALL"));
  });
});

describe("primary + secondary sport planning", () => {
  it("keeps secondary sports listed without inventing double volume", () => {
    const profile = emptySportsIdentity("athlete-1");
    profile.primarySport = "RUNNING";
    profile.secondarySports = ["STRENGTH"];
    profile.primaryGoal = "ENDURANCE";
    const card = adaptTodaySession({
      profile,
      readiness: {
        score: null,
        band: null,
        source: "unauthorized",
        available: false,
        detail: "none"
      },
      recentPlanIds: []
    });
    expect(card.sportId).toBe("RUNNING");
    expect(profile.secondarySports).toContain("STRENGTH");
    // Single composed session for today — no duplicated MAIN blocks from secondary
    const mains = card.session.blocks.filter((b) => b.kind === "MAIN");
    expect(mains.length).toBeLessThanOrEqual(2);
  });
});

describe("end-to-end domain journey (memory backend)", () => {
  beforeEach(() => {
    __resetSportsIdentityMemory();
    __resetTrainingCompletionMemory();
    __resetNutritionPersistenceMemory();
    __resetNutritionDiaryForTests();
  });

  it("profile → today → complete → nutrition plan → confirm log → grocery", async () => {
    const saved = await upsertSportsIdentity("athlete-e2e", {
      primarySport: "RUNNING",
      secondarySports: ["STRENGTH"],
      sportLevel: "INTERMEDIATE",
      primaryGoal: "ENDURANCE",
      trainingDaysPerWeek: 4,
      sessionDurationMin: 50
    });
    expect(saved.profile.primarySport).toBe("RUNNING");
    expect(saved.backend).toBe("memory");

    const loaded = await readSportsIdentity("athlete-e2e");
    expect(loaded.profile.primaryGoal).toBe("ENDURANCE");

    const card = adaptTodaySession({
      profile: loaded.profile,
      readiness: {
        score: 82,
        band: "READY",
        source: "health_connect",
        available: true,
        detail: "ok"
      },
      recentPlanIds: []
    });
    expect(card.session.explanation.what).toBeTruthy();
    expect(card.session.explanation.why).toBeTruthy();
    expect(card.session.explanation.confidence).toBeTruthy();

    const done = await saveTrainingCompletion({
      id: "stc_e2e_1",
      userId: "athlete-e2e",
      sportId: "RUNNING",
      sessionType: card.session.sessionType,
      title: card.session.title,
      startedAtISO: new Date(Date.now() - 3600_000).toISOString(),
      completedAtISO: new Date().toISOString(),
      durationSec: card.session.durationMin * 60,
      blocksCompleted: card.session.blocks.length,
      payload: { blocks: card.session.blocks.map((b) => b.kind) },
      trainingLoadLabel: card.trainingLoadLabel,
      rpe: 7,
      notes: null,
      syncState: "SYNCING"
    });
    expect(["SYNCED", "QUEUED"]).toContain(done.syncState);

    const history = await listTrainingCompletions("athlete-e2e");
    expect(history.sessions.length).toBeGreaterThan(0);

    await upsertNutritionProfile("athlete-e2e", {
      goal: "ENDURANCE",
      bodyMassKg: 70,
      allergies: ["peanut"],
      countryLocale: "pt-PT"
    });

    const plan = generateWeeklyMealPlan({
      profile: {
        userId: "athlete-e2e",
        goal: "ENDURANCE",
        dietPattern: null,
        allergies: ["peanut"],
        intolerances: [],
        dislikes: [],
        religiousRestrictions: [],
        mealFrequency: 4,
        countryLocale: "pt-PT",
        highRiskContext: false,
        declaredMedicalContext: false
      },
      sportNutritionKey: getSport("RUNNING").nutritionProfileKey,
      trainingDayKind: "hard",
      bodyMassKg: 70,
      sessionDurationMin: card.session.durationMin,
      weekStartISO: "2026-09-14"
    });
    expect(plan.days).toHaveLength(7);
    const slot = plan.days[0]!.slots[0]!;
    const swaps = suggestMealSwaps({
      current: slot,
      profile: {
        userId: "athlete-e2e",
        goal: "ENDURANCE",
        dietPattern: null,
        allergies: ["peanut"],
        intolerances: [],
        dislikes: [],
        religiousRestrictions: [],
        mealFrequency: 4,
        countryLocale: "pt-PT",
        highRiskContext: false,
        declaredMedicalContext: false
      }
    });
    expect(swaps.length).toBeGreaterThan(0);
    if (swaps[0]) {
      const applied = applyMealSwap(slot, swaps[0].foodId);
      expect(applied?.foodIds[0]).toBe(swaps[0].foodId);
    }

    const grocery = buildGroceryList(plan);
    expect(grocery.every((g) => g.remainingQuantity > 0)).toBe(true);

    const log = await logFoodConfirmed({
      userId: "athlete-e2e",
      foodId: "portfir:arroz-branco-cozido",
      grams: 150,
      slot: "post_workout",
      dateISO: "2026-09-17",
      confirm: true
    });
    expect(log.ok).toBe(true);
  });
});

describe("registry coverage", () => {
  it("lists at least the acceptance sports", () => {
    const ids = new Set(listSports().map((s) => s.id));
    for (const id of MULTI) {
      expect(ids.has(id)).toBe(true);
    }
  });
});
