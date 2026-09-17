/**
 * V8.5 food adapter honesty — verification only (no new product features).
 * External network calls may return LOCAL_CACHE_ONLY / NOT_CONFIGURED / ERROR.
 */
import { describe, expect, it } from "vitest";
import {
  queryPortfir,
  queryUsda,
  queryOpenFoodFacts,
  federatedFoodSearch
} from "./food-adapters";

describe("food adapters honesty", () => {
  it("PortFIR never claims live source without proxy", async () => {
    const res = await queryPortfir("arroz", "pt-PT");
    expect(res.source).toBe("PORTFIR");
    expect(["LOCAL_CACHE_ONLY", "NOT_CONFIGURED", "AVAILABLE", "ERROR", "TIMEOUT", "RATE_LIMITED"]).toContain(
      res.state
    );
    for (const f of res.foods) {
      expect(f.source).toBe("PORTFIR");
      expect(f.foodId).toBeTruthy();
      expect(f.sourceTimestamp).toBeTruthy();
    }
    if (!process.env.PORTFIR_PROXY_URL) {
      expect(["LOCAL_CACHE_ONLY", "NOT_CONFIGURED"]).toContain(res.state);
    }
  });

  it("USDA never exposes secret key material in response payload", async () => {
    const res = await queryUsda("banana");
    expect(res.source).toBe("USDA");
    const blob = JSON.stringify(res);
    const key = process.env.USDA_FDC_API_KEY;
    if (key) expect(blob).not.toContain(key);
    if (!key) {
      expect(["LOCAL_CACHE_ONLY", "NOT_CONFIGURED"]).toContain(res.state);
    }
  });

  it("Open Food Facts keeps LOW confidence for community products when present", async () => {
    const res = await queryOpenFoodFacts({ query: "oat" });
    expect(res.source).toBe("OPEN_FOOD_FACTS");
    for (const f of res.foods) {
      expect(f.source).toBe("OPEN_FOOD_FACTS");
      if (f.caveat) expect(f.caveat.length).toBeGreaterThan(5);
    }
  });

  it("federated search does not silently merge sources into one foodId", async () => {
    const res = await federatedFoodSearch({ query: "arroz", locale: "pt-PT" });
    const ids = res.foods.map((f) => f.foodId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(res.note).toMatch(/not silently merged/i);
    for (const f of res.foods) {
      expect(["PORTFIR", "USDA", "OPEN_FOOD_FACTS", "USER", "UNKNOWN"]).toContain(f.source);
    }
  });

  it("unknown foodId is empty — not fabricated", async () => {
    const res = await federatedFoodSearch({ foodId: "missing:xyz" });
    expect(res.foods).toHaveLength(0);
    expect(res.note).toMatch(/not fabricated/i);
  });
});
