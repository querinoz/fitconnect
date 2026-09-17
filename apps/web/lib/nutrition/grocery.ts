import type { FoodRecord } from "./types";
import type { GeneratedMealPlan, PantryItem } from "./meal-planner";
import { getFoodById } from "./sources/food-catalog";

export type GroceryLine = {
  foodId: string;
  name: string;
  source: FoodRecord["source"];
  quantityNeeded: number;
  unit: string;
  category: string;
  pantryQuantity: number;
  remainingQuantity: number;
  shoppingPriority: "high" | "medium" | "low";
};

function categoryFor(food: FoodRecord): string {
  const n = food.name.toLowerCase();
  if (/arroz|oat|banana|feij/.test(n)) return "staples";
  if (/chicken|meat|fish/.test(n)) return "protein";
  if (/drink|milk|água|water/.test(n)) return "beverages";
  return "other";
}

/** Build grocery list from meal plan − pantry; never invents quantities beyond plan servings. */
export function buildGroceryList(
  plan: GeneratedMealPlan,
  pantry: PantryItem[] = []
): GroceryLine[] {
  const needed = new Map<string, number>();
  for (const day of plan.days) {
    for (const slot of day.slots) {
      for (const id of slot.foodIds) {
        needed.set(id, (needed.get(id) ?? 0) + 1);
      }
    }
  }

  const pantryMap = new Map(pantry.map((p) => [p.foodId, p.quantity]));
  const lines: GroceryLine[] = [];

  for (const [foodId, qty] of needed) {
    const food = getFoodById(foodId);
    if (!food) continue;
    const have = pantryMap.get(foodId) ?? 0;
    const remaining = Math.max(0, qty - have);
    if (remaining <= 0) continue;
    lines.push({
      foodId,
      name: food.name,
      source: food.source,
      quantityNeeded: qty,
      unit: "serving",
      category: categoryFor(food),
      pantryQuantity: have,
      remainingQuantity: remaining,
      shoppingPriority: remaining >= 4 ? "high" : remaining >= 2 ? "medium" : "low"
    });
  }

  return lines.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.shoppingPriority] - p[b.shoppingPriority] || a.name.localeCompare(b.name);
  });
}
