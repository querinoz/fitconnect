import type { FoodRecord } from "./types";
import { getFoodById } from "./sources/food-catalog";

export type RecipeIngredient = {
  foodId: string;
  grams: number;
};

export type Recipe = {
  recipeId: string;
  name: string;
  locale: string;
  servings: number;
  preparation: string;
  ingredients: RecipeIngredient[];
  mealTiming: Array<"PRE_WORKOUT" | "POST_WORKOUT" | "RECOVERY" | "REST_DAY" | "ANY">;
  sportSuitability: string[];
  allergens: string[];
  dietTags: string[];
  prepTimeMin: number;
  costEstimate: "low" | "medium" | "high" | null;
};

export const RECIPE_SEED: Recipe[] = [
  {
    recipeId: "recipe:pt-arroz-feijao-frango",
    name: "Arroz, feijão e frango",
    locale: "pt-PT",
    servings: 2,
    preparation: "Cozinhar arroz e feijão; grelhar peito de frango; servir.",
    ingredients: [
      { foodId: "portfir:arroz-branco-cozido", grams: 200 },
      { foodId: "portfir:feijao-branco-cozido", grams: 150 },
      { foodId: "usda:chicken-breast-cooked", grams: 180 }
    ],
    mealTiming: ["POST_WORKOUT", "RECOVERY", "ANY"],
    sportSuitability: ["endurance", "strength", "team_sport", "hybrid"],
    allergens: [],
    dietTags: [],
    prepTimeMin: 35,
    costEstimate: "medium"
  },
  {
    recipeId: "recipe:pre-run-banana-oat",
    name: "Banana + oat drink (pre-session)",
    locale: "en",
    servings: 1,
    preparation: "Combine banana with oat drink 60–90 min before session.",
    ingredients: [
      { foodId: "usda:banana-raw", grams: 120 },
      { foodId: "off:oat-drink-demo", grams: 250 }
    ],
    mealTiming: ["PRE_WORKOUT"],
    sportSuitability: ["endurance", "hybrid"],
    allergens: [],
    dietTags: ["vegetarian"],
    prepTimeMin: 5,
    costEstimate: "low"
  }
];

export type RecipeNutrition = {
  recipeId: string;
  perServing: {
    kcal: number;
    proteinG: number;
    carbohydrateG: number;
    fatG: number;
    fiberG: number;
  };
  missingFoodIds: string[];
  confidence: FoodRecord["confidence"];
};

/** Sum ingredient macros / servings — missing foods listed, never invented. */
export function computeRecipeNutrition(recipe: Recipe): RecipeNutrition {
  let kcal = 0;
  let proteinG = 0;
  let carbohydrateG = 0;
  let fatG = 0;
  let fiberG = 0;
  const missing: string[] = [];
  let lowest: FoodRecord["confidence"] = "HIGH";

  for (const ing of recipe.ingredients) {
    const food = getFoodById(ing.foodId);
    if (!food) {
      missing.push(ing.foodId);
      continue;
    }
    const factor = ing.grams / Math.max(1, food.grams);
    kcal += food.kcal * factor;
    proteinG += food.proteinG * factor;
    carbohydrateG += food.carbohydrateG * factor;
    fatG += food.fatG * factor;
    fiberG += (food.fiberG ?? 0) * factor;
    if (food.confidence === "LOW") lowest = "LOW";
    else if (food.confidence === "MEDIUM" && lowest === "HIGH") lowest = "MEDIUM";
  }

  const s = Math.max(1, recipe.servings);
  return {
    recipeId: recipe.recipeId,
    perServing: {
      kcal: Math.round(kcal / s),
      proteinG: Math.round((proteinG / s) * 10) / 10,
      carbohydrateG: Math.round((carbohydrateG / s) * 10) / 10,
      fatG: Math.round((fatG / s) * 10) / 10,
      fiberG: Math.round((fiberG / s) * 10) / 10
    },
    missingFoodIds: missing,
    confidence: missing.length ? "LOW" : lowest
  };
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPE_SEED.find((r) => r.recipeId === id);
}

export function listRecipes(sportKey?: string): Recipe[] {
  if (!sportKey) return RECIPE_SEED;
  return RECIPE_SEED.filter(
    (r) => r.sportSuitability.includes(sportKey) || r.sportSuitability.includes("hybrid")
  );
}
