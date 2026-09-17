import type { FoodRecord } from "../types";

/**
 * Seed foods with explicit source metadata.
 * PortFIR-style Portuguese staples use source PORTFIR (illustrative local cache —
 * production should proxy official datasets; never treat as silent absolute truth).
 */
export const FOOD_SEED: FoodRecord[] = [
  {
    foodId: "portfir:arroz-branco-cozido",
    source: "PORTFIR",
    sourceId: "PORTFIR-DEMO-001",
    name: "Arroz branco, cozido",
    locale: "pt-PT",
    servingSize: "100 g",
    grams: 100,
    kcal: 130,
    proteinG: 2.7,
    carbohydrateG: 28.2,
    fatG: 0.3,
    fiberG: 0.4,
    micronutrients: { sodium_mg: 1 },
    confidence: "MEDIUM",
    sourceTimestamp: "2026-01-01T00:00:00.000Z",
    caveat: "Cached illustrative PortFIR-shaped record — verify against INSA PortFIR 7.1 before clinical use."
  },
  {
    foodId: "portfir:feijao-branco-cozido",
    source: "PORTFIR",
    sourceId: "PORTFIR-DEMO-002",
    name: "Feijão branco, cozido",
    locale: "pt-PT",
    servingSize: "100 g",
    grams: 100,
    kcal: 114,
    proteinG: 7.5,
    carbohydrateG: 16.5,
    fatG: 0.5,
    fiberG: 6.2,
    micronutrients: { iron_mg: 2.1 },
    confidence: "MEDIUM",
    sourceTimestamp: "2026-01-01T00:00:00.000Z",
    caveat: "Cached illustrative PortFIR-shaped record."
  },
  {
    foodId: "usda:chicken-breast-cooked",
    source: "USDA",
    sourceId: "USDA-FDC-DEMO-171077",
    name: "Chicken breast, cooked",
    locale: "en",
    servingSize: "100 g",
    grams: 100,
    kcal: 165,
    proteinG: 31,
    carbohydrateG: 0,
    fatG: 3.6,
    fiberG: 0,
    micronutrients: {},
    confidence: "MEDIUM",
    sourceTimestamp: "2026-01-01T00:00:00.000Z",
    caveat: "Demo USDA-shaped cache — production must call FoodData Central with attribution."
  },
  {
    foodId: "usda:banana-raw",
    source: "USDA",
    sourceId: "USDA-FDC-DEMO-173944",
    name: "Banana, raw",
    locale: "en",
    servingSize: "100 g",
    grams: 100,
    kcal: 89,
    proteinG: 1.1,
    carbohydrateG: 22.8,
    fatG: 0.3,
    fiberG: 2.6,
    micronutrients: { potassium_mg: 358 },
    confidence: "MEDIUM",
    sourceTimestamp: "2026-01-01T00:00:00.000Z",
    caveat: "Demo USDA-shaped cache."
  },
  {
    foodId: "off:oat-drink-demo",
    source: "OPEN_FOOD_FACTS",
    sourceId: "OFF-DEMO-OAT",
    name: "Oat drink (generic)",
    locale: "en",
    servingSize: "100 ml",
    grams: 100,
    kcal: 45,
    proteinG: 0.8,
    carbohydrateG: 7.2,
    fatG: 1.5,
    fiberG: 0.8,
    micronutrients: {},
    confidence: "LOW",
    sourceTimestamp: "2026-01-01T00:00:00.000Z",
    barcode: null,
    caveat: "Community/branded data may vary — confirm label before logging."
  }
];

export function searchFoods(query: string, locale?: string): FoodRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_SEED.slice(0, 20);
  return FOOD_SEED.filter((f) => {
    if (locale && f.locale !== locale && !f.locale.startsWith(locale.slice(0, 2))) {
      // still allow cross-locale hits for global coverage
    }
    return f.name.toLowerCase().includes(q) || f.sourceId.toLowerCase().includes(q);
  });
}

export function getFoodById(foodId: string): FoodRecord | undefined {
  return FOOD_SEED.find((f) => f.foodId === foodId);
}

export function getFoodByBarcode(barcode: string): FoodRecord | undefined {
  return FOOD_SEED.find((f) => f.barcode === barcode);
}
