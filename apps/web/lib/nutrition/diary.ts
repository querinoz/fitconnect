import type { MealSlotId } from "./types";
import { getFoodById } from "./sources/food-catalog";
import {
  insertFoodLog,
  listFoodLogsPersisted,
  type FoodLogRow
} from "./nutrition-repository";

export type FoodLogEntry = {
  logId: string;
  userId: string;
  foodId: string;
  food: NonNullable<ReturnType<typeof getFoodById>>;
  grams: number;
  slot: MealSlotId | null;
  dateISO: string;
  confirmedAtISO: string;
  source: "user_confirm";
};

export type LogFoodInput = {
  userId: string;
  foodId: string;
  grams: number;
  slot?: MealSlotId | null;
  dateISO: string;
  /** Must be true — silent AI/agent writes are rejected */
  confirm: boolean;
};

export type LogFoodResult =
  | { ok: true; entry: FoodLogEntry; backend: "postgres" | "memory" }
  | { ok: false; error: "confirmation_required" | "food_not_found" | "invalid_grams" };

export async function logFoodConfirmed(input: LogFoodInput): Promise<LogFoodResult> {
  if (!input.confirm) {
    return { ok: false, error: "confirmation_required" };
  }
  if (!(input.grams > 0) || !Number.isFinite(input.grams)) {
    return { ok: false, error: "invalid_grams" };
  }
  const food = getFoodById(input.foodId);
  if (!food) {
    return { ok: false, error: "food_not_found" };
  }
  const entry: FoodLogEntry = {
    logId: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: input.userId,
    foodId: food.foodId,
    food,
    grams: input.grams,
    slot: input.slot ?? null,
    dateISO: input.dateISO,
    confirmedAtISO: new Date().toISOString(),
    source: "user_confirm"
  };
  const row: FoodLogRow = {
    id: entry.logId,
    userId: entry.userId,
    foodId: entry.foodId,
    food: entry.food,
    grams: entry.grams,
    slot: entry.slot,
    dateISO: entry.dateISO,
    confirmedAtISO: entry.confirmedAtISO,
    source: "user_confirm"
  };
  const { backend } = await insertFoodLog(row);
  return { ok: true, entry, backend };
}

export async function listFoodLogs(userId: string, dateISO?: string): Promise<FoodLogEntry[]> {
  const { logs } = await listFoodLogsPersisted(userId, dateISO);
  return logs.map((e) => ({
    logId: e.id,
    userId: e.userId,
    foodId: e.foodId,
    food: e.food,
    grams: e.grams,
    slot: e.slot,
    dateISO: e.dateISO,
    confirmedAtISO: e.confirmedAtISO,
    source: "user_confirm"
  }));
}

export { __resetNutritionPersistenceMemory as __resetNutritionDiaryForTests } from "./nutrition-repository";
