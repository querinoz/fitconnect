import type { FoodRecord } from "../types";
import { federatedFoodSearch } from "./food-adapters";

export type FoodLookupState =
  | "AVAILABLE"
  | "LOCAL_CACHE_ONLY"
  | "REMOTE_UNAVAILABLE"
  | "NOT_CONFIGURED"
  | "ERROR"
  | "TIMEOUT"
  | "RATE_LIMITED";

export type FoodLookupResult = {
  foods: FoodRecord[];
  state: FoodLookupState;
  sourcesQueried: string[];
  note: string;
  bySource?: unknown[];
};

/**
 * CLIENT → FitConnect API → adapters. Never call external APIs from the browser.
 */
export async function lookupFoods(params: {
  query?: string;
  foodId?: string;
  barcode?: string;
  locale?: string;
}): Promise<FoodLookupResult> {
  const result = await federatedFoodSearch(params);
  return {
    foods: result.foods,
    state: result.state as FoodLookupState,
    sourcesQueried: (result.bySource ?? []).map((b) => (b as { source: string }).source),
    note: result.note,
    bySource: result.bySource
  };
}
