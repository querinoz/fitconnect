import type { FoodRecord, FoodSource, NutritionConfidence } from "../types";
import { getFoodByBarcode, getFoodById, searchFoods } from "./food-catalog";

export type AdapterState =
  | "AVAILABLE"
  | "LOCAL_CACHE_ONLY"
  | "NOT_CONFIGURED"
  | "TIMEOUT"
  | "ERROR"
  | "RATE_LIMITED";

export type AdapterResult = {
  foods: FoodRecord[];
  state: AdapterState;
  source: FoodSource;
  note: string;
  latencyMs: number;
};

const DEFAULT_TIMEOUT_MS = 4000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function mapConfidence(raw: unknown): NutritionConfidence {
  if (raw === "HIGH" || raw === "high") return "HIGH";
  if (raw === "LOW" || raw === "low") return "LOW";
  return "MEDIUM";
}

/** PortFIR via optional institutional proxy — never scrape INSA directly from clients. */
export async function queryPortfir(query: string, locale?: string): Promise<AdapterResult> {
  const started = Date.now();
  const proxy = process.env.PORTFIR_PROXY_URL;
  const local = searchFoods(query, locale ?? "pt-PT").filter((f) => f.source === "PORTFIR");

  if (!proxy) {
    return {
      foods: local,
      state: local.length ? "LOCAL_CACHE_ONLY" : "NOT_CONFIGURED",
      source: "PORTFIR",
      note: local.length
        ? "PortFIR-tagged local cache. Live PORTFIR_PROXY_URL not configured."
        : "PortFIR proxy not configured — no fabricated foods.",
      latencyMs: Date.now() - started
    };
  }

  try {
    const url = new URL(proxy);
    url.searchParams.set("q", query);
    if (locale) url.searchParams.set("locale", locale);
    const res = await fetchWithTimeout(url.toString(), {
      headers: { Accept: "application/json" }
    });
    if (res.status === 429) {
      return {
        foods: local,
        state: "RATE_LIMITED",
        source: "PORTFIR",
        note: "PortFIR proxy rate-limited — serving local cache only.",
        latencyMs: Date.now() - started
      };
    }
    if (!res.ok) {
      return {
        foods: local,
        state: "ERROR",
        source: "PORTFIR",
        note: `PortFIR proxy HTTP ${res.status} — local cache fallback.`,
        latencyMs: Date.now() - started
      };
    }
    const body = (await res.json()) as { foods?: FoodRecord[] };
    const foods = Array.isArray(body.foods) ? body.foods : [];
    return {
      foods: foods.length ? foods : local,
      state: foods.length ? "AVAILABLE" : "LOCAL_CACHE_ONLY",
      source: "PORTFIR",
      note: foods.length
        ? "Live PortFIR proxy response."
        : "Proxy returned empty — local PortFIR-tagged cache.",
      latencyMs: Date.now() - started
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      foods: local,
      state: aborted ? "TIMEOUT" : "ERROR",
      source: "PORTFIR",
      note: aborted
        ? "PortFIR proxy timeout — local cache fallback."
        : "PortFIR proxy error — local cache fallback.",
      latencyMs: Date.now() - started
    };
  }
}

/** USDA FoodData Central — server-side only (API key never to client). */
export async function queryUsda(query: string): Promise<AdapterResult> {
  const started = Date.now();
  const key = process.env.USDA_FDC_API_KEY;
  const local = searchFoods(query).filter((f) => f.source === "USDA");

  if (!key) {
    return {
      foods: local,
      state: local.length ? "LOCAL_CACHE_ONLY" : "NOT_CONFIGURED",
      source: "USDA",
      note: "USDA_FDC_API_KEY not configured — local USDA-tagged cache only.",
      latencyMs: Date.now() - started
    };
  }

  try {
    const res = await fetchWithTimeout("https://api.nal.usda.gov/fdc/v1/foods/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": key
      },
      body: JSON.stringify({ query, pageSize: 10 })
    });
    if (res.status === 429) {
      return {
        foods: local,
        state: "RATE_LIMITED",
        source: "USDA",
        note: "USDA rate-limited — local cache fallback.",
        latencyMs: Date.now() - started
      };
    }
    if (!res.ok) {
      return {
        foods: local,
        state: "ERROR",
        source: "USDA",
        note: `USDA HTTP ${res.status} — local cache fallback.`,
        latencyMs: Date.now() - started
      };
    }
    const body = (await res.json()) as {
      foods?: Array<{
        fdcId: number;
        description: string;
        foodNutrients?: Array<{ nutrientName?: string; value?: number; unitName?: string }>;
      }>;
    };
    const foods: FoodRecord[] = (body.foods ?? []).slice(0, 10).map((f) => {
      const nutrients = f.foodNutrients ?? [];
      const find = (name: string) =>
        nutrients.find((n) => (n.nutrientName ?? "").toLowerCase().includes(name))?.value ?? 0;
      return {
        foodId: `usda:fdc-${f.fdcId}`,
        source: "USDA" as const,
        sourceId: String(f.fdcId),
        name: f.description,
        locale: "en",
        servingSize: "100 g",
        grams: 100,
        kcal: find("energy") || find("calorie"),
        proteinG: find("protein"),
        carbohydrateG: find("carbohydrate"),
        fatG: find("fat") || find("total lipid"),
        fiberG: find("fiber") || null,
        micronutrients: {},
        confidence: mapConfidence("MEDIUM"),
        sourceTimestamp: new Date().toISOString(),
        caveat: "USDA FoodData Central — values per API serving basis; confirm before logging."
      };
    });
    return {
      foods: foods.length ? foods : local,
      state: foods.length ? "AVAILABLE" : "LOCAL_CACHE_ONLY",
      source: "USDA",
      note: foods.length ? "Live USDA FoodData Central." : "USDA empty — local tagged cache.",
      latencyMs: Date.now() - started
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      foods: local,
      state: aborted ? "TIMEOUT" : "ERROR",
      source: "USDA",
      note: aborted ? "USDA timeout — local cache." : "USDA error — local cache.",
      latencyMs: Date.now() - started
    };
  }
}

/** Open Food Facts — branded/barcode; community data is never absolute truth. */
export async function queryOpenFoodFacts(params: {
  query?: string;
  barcode?: string;
}): Promise<AdapterResult> {
  const started = Date.now();
  const ua = process.env.OPEN_FOOD_FACTS_USER_AGENT ?? "FitConnect/8.5 (nutrition; contact=dev)";
  const local = params.barcode
    ? (() => {
        const hit = getFoodByBarcode(params.barcode!);
        return hit ? [hit] : [];
      })()
    : searchFoods(params.query ?? "").filter((f) => f.source === "OPEN_FOOD_FACTS");

  // Always allow OFF public API with User-Agent; no secret required.
  try {
    if (params.barcode) {
      const res = await fetchWithTimeout(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(params.barcode)}.json`,
        { headers: { "User-Agent": ua, Accept: "application/json" } }
      );
      if (!res.ok) {
        return {
          foods: local,
          state: res.status === 429 ? "RATE_LIMITED" : "ERROR",
          source: "OPEN_FOOD_FACTS",
          note: `OFF barcode HTTP ${res.status}`,
          latencyMs: Date.now() - started
        };
      }
      const body = (await res.json()) as {
        status?: number;
        product?: {
          product_name?: string;
          code?: string;
          nutriments?: Record<string, number>;
        };
      };
      if (body.status !== 1 || !body.product) {
        return {
          foods: local,
          state: local.length ? "LOCAL_CACHE_ONLY" : "AVAILABLE",
          source: "OPEN_FOOD_FACTS",
          note: "No OFF product for barcode — not fabricated.",
          latencyMs: Date.now() - started
        };
      }
      const n = body.product.nutriments ?? {};
      const food: FoodRecord = {
        foodId: `off:${body.product.code ?? params.barcode}`,
        source: "OPEN_FOOD_FACTS",
        sourceId: body.product.code ?? params.barcode,
        name: body.product.product_name ?? `Product ${params.barcode}`,
        locale: "und",
        servingSize: "100 g",
        grams: 100,
        kcal: n["energy-kcal_100g"] ?? n.energy_kcal_100g ?? 0,
        proteinG: n.proteins_100g ?? 0,
        carbohydrateG: n.carbohydrates_100g ?? 0,
        fatG: n.fat_100g ?? 0,
        fiberG: n.fiber_100g ?? null,
        micronutrients: {},
        confidence: "LOW",
        sourceTimestamp: new Date().toISOString(),
        barcode: body.product.code ?? params.barcode,
        caveat: "Community/branded OFF data — confirm package label before logging."
      };
      return {
        foods: [food],
        state: "AVAILABLE",
        source: "OPEN_FOOD_FACTS",
        note: "Open Food Facts barcode lookup — confirm before log.",
        latencyMs: Date.now() - started
      };
    }

    const q = (params.query ?? "").trim();
    if (!q) {
      return {
        foods: local,
        state: "LOCAL_CACHE_ONLY",
        source: "OPEN_FOOD_FACTS",
        note: "Empty query — local OFF-tagged cache only.",
        latencyMs: Date.now() - started
      };
    }

    const res = await fetchWithTimeout(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8`,
      { headers: { "User-Agent": ua, Accept: "application/json" } }
    );
    if (!res.ok) {
      return {
        foods: local,
        state: res.status === 429 ? "RATE_LIMITED" : "ERROR",
        source: "OPEN_FOOD_FACTS",
        note: `OFF search HTTP ${res.status}`,
        latencyMs: Date.now() - started
      };
    }
    const body = (await res.json()) as {
      products?: Array<{
        code?: string;
        product_name?: string;
        nutriments?: Record<string, number>;
      }>;
    };
    const foods: FoodRecord[] = (body.products ?? [])
      .filter((p) => p.product_name)
      .slice(0, 8)
      .map((p) => {
        const n = p.nutriments ?? {};
        return {
          foodId: `off:${p.code ?? p.product_name}`,
          source: "OPEN_FOOD_FACTS" as const,
          sourceId: p.code ?? "unknown",
          name: p.product_name!,
          locale: "und",
          servingSize: "100 g",
          grams: 100,
          kcal: n["energy-kcal_100g"] ?? 0,
          proteinG: n.proteins_100g ?? 0,
          carbohydrateG: n.carbohydrates_100g ?? 0,
          fatG: n.fat_100g ?? 0,
          fiberG: n.fiber_100g ?? null,
          micronutrients: {},
          confidence: "LOW" as const,
          sourceTimestamp: new Date().toISOString(),
          barcode: p.code ?? null,
          caveat: "Community OFF data — confirm before logging."
        };
      });
    return {
      foods: foods.length ? foods : local,
      state: foods.length ? "AVAILABLE" : "LOCAL_CACHE_ONLY",
      source: "OPEN_FOOD_FACTS",
      note: foods.length ? "Open Food Facts search." : "OFF empty — local tagged cache.",
      latencyMs: Date.now() - started
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      foods: local,
      state: aborted ? "TIMEOUT" : "ERROR",
      source: "OPEN_FOOD_FACTS",
      note: aborted ? "OFF timeout — local cache." : "OFF error — local cache.",
      latencyMs: Date.now() - started
    };
  }
}

/**
 * Priority: PortFIR (PT) → USDA (global) → OFF (branded).
 * Sources are never silently merged into one authoritative row.
 */
export async function federatedFoodSearch(params: {
  query?: string;
  barcode?: string;
  foodId?: string;
  locale?: string;
}): Promise<{
  foods: FoodRecord[];
  bySource: AdapterResult[];
  state: AdapterState;
  note: string;
}> {
  if (params.foodId) {
    const food = getFoodById(params.foodId);
    return {
      foods: food ? [food] : [],
      bySource: [],
      state: food ? "LOCAL_CACHE_ONLY" : "AVAILABLE",
      note: food ? "Resolved local food_id." : "Unknown food_id — not fabricated."
    };
  }

  if (params.barcode) {
    const off = await queryOpenFoodFacts({ barcode: params.barcode });
    return {
      foods: off.foods,
      bySource: [off],
      state: off.state,
      note: off.note
    };
  }

  const q = (params.query ?? "").trim();
  const locale = params.locale ?? "pt-PT";
  const preferPt = locale.toLowerCase().startsWith("pt");

  const portfir = await queryPortfir(q, locale);
  const usda = await queryUsda(q);
  // OFF search only when local/generic sources are empty or query looks branded
  const localHits = [...portfir.foods, ...usda.foods];
  const looksBranded = /\d{8,}|®|™/.test(q) || q.split(/\s+/).length >= 3;
  const off =
    localHits.length === 0 || looksBranded
      ? await queryOpenFoodFacts({ query: q })
      : {
          foods: [] as FoodRecord[],
          state: "LOCAL_CACHE_ONLY" as const,
          source: "OPEN_FOOD_FACTS" as const,
          note: "OFF search skipped — PortFIR/USDA cache sufficient for generic query.",
          latencyMs: 0
        };

  const bySource = preferPt ? [portfir, usda, off] : [usda, portfir, off];
  const seen = new Set<string>();
  const foods: FoodRecord[] = [];
  for (const block of bySource) {
    for (const f of block.foods) {
      if (seen.has(f.foodId)) continue;
      seen.add(f.foodId);
      foods.push(f);
    }
  }

  const anyLive = bySource.some((b) => b.state === "AVAILABLE");
  const anyConfigured = bySource.some((b) => b.state !== "NOT_CONFIGURED");
  return {
    foods,
    bySource,
    state: anyLive ? "AVAILABLE" : anyConfigured ? "LOCAL_CACHE_ONLY" : "NOT_CONFIGURED",
    note: "Sources kept separate with metadata — values are not silently merged."
  };
}
