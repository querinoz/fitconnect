import { describe, expect, it } from "vitest";
import {
  planDailyTargets,
  allergenBlocked,
  blockedForCombatWeightCut,
  lowEnergyAvailabilityFlag
} from "./planning-engine";
import { searchFoods, getFoodById } from "./sources/food-catalog";
import type { NutritionProfile } from "./types";

const baseProfile = (): NutritionProfile => ({
  userId: "u1",
  goal: "PERFORMANCE",
  dietPattern: null,
  allergies: ["peanut"],
  intolerances: [],
  dislikes: [],
  religiousRestrictions: [],
  mealFrequency: 3,
  countryLocale: "pt-PT",
  highRiskContext: false,
  declaredMedicalContext: false
});

describe("nutrition planning", () => {
  it("returns ESTIMATE targets with explanations when goal + mass present", () => {
    const t = planDailyTargets({
      profile: baseProfile(),
      sportNutritionKey: "endurance",
      trainingDayKind: "hard",
      bodyMassKg: 70,
      sessionDurationMin: 60
    });
    expect(t.estimateKind).toBe("ESTIMATE");
    expect(t.kcal).toBeGreaterThan(0);
    expect(t.proteinG).toBeGreaterThan(0);
    expect(t.explanations.some((e) => /ESTIMATE/i.test(e))).toBe(true);
  });

  it("withholds aggressive prescription for high-risk context", () => {
    const profile = baseProfile();
    profile.highRiskContext = true;
    const t = planDailyTargets({
      profile,
      sportNutritionKey: "general",
      trainingDayKind: "easy",
      bodyMassKg: 70,
      sessionDurationMin: null
    });
    expect(t.kcal).toBeNull();
    expect(t.safetyFlags.some((f) => f.code === "HIGH_RISK_CONTEXT")).toBe(true);
  });

  it("blocks combat acute weight cut automation", () => {
    const flag = blockedForCombatWeightCut("combat");
    expect(flag?.code).toBe("COMBAT_WEIGHT_CUT_BLOCKED");
  });

  it("raises LEA warning and does not further restrict", () => {
    const flag = lowEnergyAvailabilityFlag({
      estimatedKcal: 1400,
      bodyMassKg: 70,
      hardTraining: true
    });
    expect(flag?.code).toBe("LOW_ENERGY_AVAILABILITY_RISK");
  });

  it("blocks allergens from food names", () => {
    const food = getFoodById("usda:chicken-breast-cooked")!;
    expect(allergenBlocked(food, ["peanut"])).toBe(false);
    expect(allergenBlocked({ ...food, name: "Peanut butter" }, ["peanut"])).toBe(true);
  });
});

describe("food catalog", () => {
  it("searches PortFIR-tagged Portuguese foods with source metadata", () => {
    const hits = searchFoods("arroz");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]!.source).toBe("PORTFIR");
    expect(hits[0]!.caveat).toBeTruthy();
  });
});
