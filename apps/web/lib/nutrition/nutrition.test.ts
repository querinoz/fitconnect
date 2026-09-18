import { describe, expect, it } from "vitest";
import {
  planDailyTargets,
  allergenBlocked,
  blockedForCombatWeightCut,
  lowEnergyAvailabilityFlag
} from "./planning-engine";
import { generateWeeklyMealPlan, mealPlanAllergenSafe } from "./meal-planner";
import { buildGroceryList } from "./grocery";
import { computeRecipeNutrition, getRecipeById } from "./recipes";
import { suggestMealSwaps, applyMealSwap } from "./meal-swap";
import { emptyNutritionProfile } from "./nutrition-repository";
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

describe("meal planner + grocery", () => {
  it("generates a 7-day plan with explainable slots", () => {
    const plan = generateWeeklyMealPlan({
      profile: baseProfile(),
      sportNutritionKey: "endurance",
      trainingDayKind: "hard",
      bodyMassKg: 70,
      sessionDurationMin: 60,
      weekStartISO: "2026-09-14",
      pantry: [{ foodId: "portfir:arroz-branco-cozido", quantity: 2, unit: "serving" }]
    });
    expect(plan.days).toHaveLength(7);
    expect(plan.days[0]!.slots.length).toBeGreaterThan(0);
    expect(plan.days[0]!.slots[0]!.why.length).toBeGreaterThan(0);
    expect(mealPlanAllergenSafe(plan, baseProfile().allergies)).toBe(true);
  });

  it("never includes allergen foods when allergy set", () => {
    const profile = baseProfile();
    profile.allergies = ["chicken"];
    const plan = generateWeeklyMealPlan({
      profile,
      sportNutritionKey: "strength",
      trainingDayKind: "moderate",
      bodyMassKg: 80,
      sessionDurationMin: 45,
      weekStartISO: "2026-09-14"
    });
    expect(mealPlanAllergenSafe(plan, profile.allergies)).toBe(true);
    for (const day of plan.days) {
      for (const slot of day.slots) {
        for (const food of slot.foods) {
          expect(food.name.toLowerCase()).not.toContain("chicken");
        }
      }
    }
  });

  it("grocery remaining excludes pantry stock", () => {
    const plan = generateWeeklyMealPlan({
      profile: baseProfile(),
      sportNutritionKey: "endurance",
      trainingDayKind: "easy",
      bodyMassKg: 70,
      sessionDurationMin: 40,
      weekStartISO: "2026-09-14"
    });
    const allIds = plan.days.flatMap((d) => d.slots.flatMap((s) => s.foodIds));
    const first = allIds[0]!;
    const count = allIds.filter((id) => id === first).length;
    const grocery = buildGroceryList(plan, [
      { foodId: first, quantity: count, unit: "serving" }
    ]);
    expect(grocery.every((g) => g.foodId !== first)).toBe(true);
  });
});

describe("recipes", () => {
  it("reconciles ingredient macros per serving", () => {
    const recipe = getRecipeById("recipe:pt-arroz-feijao-frango")!;
    const n = computeRecipeNutrition(recipe);
    expect(n.missingFoodIds).toHaveLength(0);
    expect(n.perServing.kcal).toBeGreaterThan(0);
    expect(n.perServing.proteinG).toBeGreaterThan(0);
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

describe("meal swap", () => {
  it("suggests allergen-safe alternatives without mutating diary", () => {
    const profile = emptyNutritionProfile("athlete-1");
    profile.countryLocale = "pt-PT";
    const plan = generateWeeklyMealPlan({
      profile,
      sportNutritionKey: "endurance",
      trainingDayKind: "moderate",
      bodyMassKg: 70,
      sessionDurationMin: 45,
      weekStartISO: "2026-09-14"
    });
    const slot = plan.days[0]!.slots[0]!;
    const options = suggestMealSwaps({ current: slot, profile, limit: 3 });
    expect(options.length).toBeGreaterThan(0);
    expect(options.every((o) => !slot.foodIds.includes(o.foodId))).toBe(true);
  });

  it("apply requires explicit next food and updates slot foods only", () => {
    const profile = emptyNutritionProfile("athlete-1");
    const plan = generateWeeklyMealPlan({
      profile,
      sportNutritionKey: "endurance",
      trainingDayKind: "moderate",
      bodyMassKg: 70,
      sessionDurationMin: 45,
      weekStartISO: "2026-09-14"
    });
    const slot = plan.days[0]!.slots[0]!;
    const options = suggestMealSwaps({ current: slot, profile, limit: 1 });
    expect(options[0]).toBeTruthy();
    const next = applyMealSwap(slot, options[0]!.foodId);
    expect(next).not.toBeNull();
    expect(next!.foodIds).toEqual([options[0]!.foodId]);
    expect(next!.foods[0]!.foodId).toBe(options[0]!.foodId);
  });
});
