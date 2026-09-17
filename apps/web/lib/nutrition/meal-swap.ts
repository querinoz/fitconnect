import type { PlannedMealSlot } from "./meal-planner";
import { allergenBlocked } from "./planning-engine";
import { FOOD_SEED } from "./sources/food-catalog";
import type { NutritionProfile } from "./types";

export type MealSwapOption = {
  foodId: string;
  name: string;
  why: string[];
  source: string;
};

/** Suggest swap candidates that preserve allergen safety — never auto-apply. */
export function suggestMealSwaps(params: {
  current: PlannedMealSlot;
  profile: NutritionProfile;
  limit?: number;
}): MealSwapOption[] {
  const used = new Set(params.current.foodIds);
  const options: MealSwapOption[] = [];
  for (const food of FOOD_SEED) {
    if (used.has(food.foodId)) continue;
    if (allergenBlocked(food, params.profile.allergies)) continue;
    if (params.profile.dislikes.some((d) => d && food.name.toLowerCase().includes(d.toLowerCase()))) {
      continue;
    }
    const why: string[] = ["Alternative from source-tagged catalog"];
    if (params.profile.countryLocale.startsWith("pt") && food.source === "PORTFIR") {
      why.push("PortFIR-tagged for PT locale");
    }
    if (params.current.slot.includes("workout") && food.proteinG >= 10) {
      why.push("Supports session protein context");
    }
    options.push({
      foodId: food.foodId,
      name: food.name,
      why,
      source: food.source
    });
    if (options.length >= (params.limit ?? 5)) break;
  }
  return options;
}

/** Apply user-selected swap — explicit selection required by caller. */
export function applyMealSwap(
  slot: PlannedMealSlot,
  nextFoodId: string
): PlannedMealSlot | null {
  const food = FOOD_SEED.find((f) => f.foodId === nextFoodId);
  if (!food) return null;
  return {
    ...slot,
    foodIds: [food.foodId],
    foods: [food],
    why: [`User-selected swap to ${food.name}`, `Source: ${food.source}`]
  };
}
