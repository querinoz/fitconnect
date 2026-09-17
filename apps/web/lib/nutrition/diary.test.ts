import { describe, expect, it, beforeEach } from "vitest";
import {
  logFoodConfirmed,
  listFoodLogs,
  __resetNutritionDiaryForTests
} from "./diary";
import { lookupFoods } from "./sources/food-lookup";

describe("nutrition diary", () => {
  beforeEach(() => {
    __resetNutritionDiaryForTests();
  });

  it("rejects writes without explicit confirm", async () => {
    const res = await logFoodConfirmed({
      userId: "u1",
      foodId: "usda:banana-raw",
      grams: 120,
      dateISO: "2026-09-17",
      confirm: false
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("confirmation_required");
  });

  it("logs food only after confirm", async () => {
    const res = await logFoodConfirmed({
      userId: "u1",
      foodId: "usda:banana-raw",
      grams: 120,
      slot: "pre_workout",
      dateISO: "2026-09-17",
      confirm: true
    });
    expect(res.ok).toBe(true);
    const logs = await listFoodLogs("u1", "2026-09-17");
    expect(logs).toHaveLength(1);
    expect(logs[0]!.source).toBe("user_confirm");
    expect(logs[0]!.food.source).toBe("USDA");
  });
});

describe("food lookup honesty", () => {
  it("returns local cache state without inventing remote hits", async () => {
    const res = await lookupFoods({ query: "arroz" });
    expect(res.foods.length).toBeGreaterThan(0);
    expect(["LOCAL_CACHE_ONLY", "NOT_CONFIGURED", "AVAILABLE"]).toContain(res.state);
    expect(res.note.length).toBeGreaterThan(10);
  });

  it("does not fabricate unknown food ids", async () => {
    const res = await lookupFoods({ foodId: "missing:does-not-exist" });
    expect(res.foods).toHaveLength(0);
    expect(res.note).toMatch(/not fabricated/i);
  });
});
