/**
 * Geo / routing provider abstractions.
 * OpenFreeMap = tiles only. Spot intelligence stays in FitConnect Postgres.
 */

export type GeoResult = {
  label: string;
  lat: number;
  lng: number;
  country?: string | null;
  region?: string | null;
};

export type RouteMode = "walk" | "bike" | "drive";

export type RouteResult = {
  distanceM: number;
  durationSec: number;
  geometry: { type: "LineString"; coordinates: number[][] } | null;
  provider: string;
};

export type GeoProviderStatus =
  | "AVAILABLE"
  | "UNAVAILABLE"
  | "QUOTA_EXHAUSTED"
  | "ERROR"
  | "NOT_CONFIGURED";

export interface GeoProvider {
  readonly id: string;
  geocode(query: string, signal?: AbortSignal): Promise<{ status: GeoProviderStatus; results: GeoResult[] }>;
  reverseGeocode(
    lat: number,
    lng: number,
    signal?: AbortSignal
  ): Promise<{ status: GeoProviderStatus; result: GeoResult | null }>;
}

export interface RoutingProvider {
  readonly id: string;
  route(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    mode: RouteMode,
    signal?: AbortSignal
  ): Promise<{ status: GeoProviderStatus; route: RouteResult | null; message?: string }>;
}

type CacheEntry<T> = { at: number; value: T };

const geocodeCache = new Map<string, CacheEntry<{ status: GeoProviderStatus; results: GeoResult[] }>>();
const routeCache = new Map<string, CacheEntry<{ status: GeoProviderStatus; route: RouteResult | null; message?: string }>>();

const GEOCODE_TTL_MS = 10 * 60 * 1000;
const ROUTE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE = 200;

function cacheGet<T>(map: Map<string, CacheEntry<T>>, key: string, ttl: number): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet<T>(map: Map<string, CacheEntry<T>>, key: string, value: T) {
  if (map.size >= MAX_CACHE) {
    const first = map.keys().next().value;
    if (first) map.delete(first);
  }
  map.set(key, { at: Date.now(), value });
}

export class GeoapifyGeoProvider implements GeoProvider {
  readonly id = "geoapify";
  constructor(private readonly apiKey: string) {}

  async geocode(query: string, signal?: AbortSignal) {
    const q = query.trim().slice(0, 200);
    if (!q) return { status: "AVAILABLE" as const, results: [] };
    const key = `g:${q.toLowerCase()}`;
    const cached = cacheGet(geocodeCache, key, GEOCODE_TTL_MS);
    if (cached) return cached;

    try {
      const url = new URL("https://api.geoapify.com/v1/geocode/search");
      url.searchParams.set("text", q);
      url.searchParams.set("limit", "5");
      url.searchParams.set("apiKey", this.apiKey);
      const res = await fetch(url, { signal, next: { revalidate: 0 } });
      if (res.status === 429 || res.status === 402) {
        const out = { status: "QUOTA_EXHAUSTED" as const, results: [] };
        cacheSet(geocodeCache, key, out);
        return out;
      }
      if (!res.ok) {
        return { status: "ERROR" as const, results: [] };
      }
      const data = (await res.json()) as {
        features?: Array<{
          properties?: {
            formatted?: string;
            lat?: number;
            lon?: number;
            country?: string;
            state?: string;
            city?: string;
          };
        }>;
      };
      const results: GeoResult[] = (data.features ?? [])
        .map((f) => {
          const p = f.properties ?? {};
          if (typeof p.lat !== "number" || typeof p.lon !== "number") return null;
          return {
            label: p.formatted ?? `${p.lat},${p.lon}`,
            lat: p.lat,
            lng: p.lon,
            country: p.country ?? null,
            region: p.state ?? p.city ?? null,
          };
        })
        .filter(Boolean) as GeoResult[];
      const out = { status: "AVAILABLE" as const, results };
      cacheSet(geocodeCache, key, out);
      return out;
    } catch {
      return { status: "ERROR" as const, results: [] };
    }
  }

  async reverseGeocode(lat: number, lng: number, signal?: AbortSignal) {
    const key = `r:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = cacheGet(geocodeCache, key, GEOCODE_TTL_MS);
    if (cached) {
      return { status: cached.status, result: cached.results[0] ?? null };
    }
    try {
      const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("apiKey", this.apiKey);
      const res = await fetch(url, { signal, next: { revalidate: 0 } });
      if (res.status === 429 || res.status === 402) {
        return { status: "QUOTA_EXHAUSTED" as const, result: null };
      }
      if (!res.ok) return { status: "ERROR" as const, result: null };
      const data = (await res.json()) as {
        features?: Array<{ properties?: { formatted?: string; lat?: number; lon?: number; country?: string; state?: string } }>;
      };
      const p = data.features?.[0]?.properties;
      if (!p || typeof p.lat !== "number" || typeof p.lon !== "number") {
        return { status: "AVAILABLE" as const, result: null };
      }
      const result: GeoResult = {
        label: p.formatted ?? `${p.lat},${p.lon}`,
        lat: p.lat,
        lng: p.lon,
        country: p.country ?? null,
        region: p.state ?? null,
      };
      cacheSet(geocodeCache, key, { status: "AVAILABLE", results: [result] });
      return { status: "AVAILABLE" as const, result };
    } catch {
      return { status: "ERROR" as const, result: null };
    }
  }
}

export class GeoapifyRoutingProvider implements RoutingProvider {
  readonly id = "geoapify";
  constructor(private readonly apiKey: string) {}

  async route(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    mode: RouteMode,
    signal?: AbortSignal
  ) {
    const modeMap = { walk: "walk", bike: "bicycle", drive: "drive" } as const;
    const key = `rt:${mode}:${from.lat.toFixed(4)},${from.lng.toFixed(4)}:${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
    const cached = cacheGet(routeCache, key, ROUTE_TTL_MS);
    if (cached) return cached;

    try {
      const url = new URL("https://api.geoapify.com/v1/routing");
      url.searchParams.set("waypoints", `${from.lat},${from.lng}|${to.lat},${to.lng}`);
      url.searchParams.set("mode", modeMap[mode]);
      url.searchParams.set("apiKey", this.apiKey);
      const res = await fetch(url, { signal, next: { revalidate: 0 } });
      if (res.status === 429 || res.status === 402) {
        const out = { status: "QUOTA_EXHAUSTED" as const, route: null, message: "Geoapify quota exhausted" };
        cacheSet(routeCache, key, out);
        return out;
      }
      if (!res.ok) {
        return { status: "ERROR" as const, route: null, message: `HTTP ${res.status}` };
      }
      const data = (await res.json()) as {
        features?: Array<{
          properties?: { distance?: number; time?: number };
          geometry?: { type?: string; coordinates?: number[][] | number[][][] };
        }>;
      };
      const f = data.features?.[0];
      if (!f?.properties) {
        return { status: "UNAVAILABLE" as const, route: null, message: "No route" };
      }
      let geometry: { type: "LineString"; coordinates: number[][] } | null = null;
      if (f.geometry?.type === "LineString" && Array.isArray(f.geometry.coordinates)) {
        geometry = {
          type: "LineString",
          coordinates: f.geometry.coordinates as number[][],
        };
      } else if (f.geometry?.type === "MultiLineString" && Array.isArray(f.geometry.coordinates)) {
        const coords = (f.geometry.coordinates as number[][][]).flat();
        geometry = { type: "LineString", coordinates: coords };
      }
      const route: RouteResult = {
        distanceM: f.properties.distance ?? 0,
        durationSec: f.properties.time ?? 0,
        geometry,
        provider: this.id,
      };
      const out = { status: "AVAILABLE" as const, route };
      cacheSet(routeCache, key, out);
      return out;
    } catch {
      return { status: "ERROR" as const, route: null, message: "Routing failed" };
    }
  }
}

export function createGeoProvider(): GeoProvider | null {
  const key = process.env.GEOAPIFY_API_KEY?.trim();
  if (!key) return null;
  return new GeoapifyGeoProvider(key);
}

export function createRoutingProvider(): RoutingProvider | null {
  const key = process.env.GEOAPIFY_API_KEY?.trim();
  if (!key) return null;
  return new GeoapifyRoutingProvider(key);
}

/** ConditionsProvider stub — weather not wired this phase. */
export type ConditionsProvider = {
  readonly id: string;
  getConditions(_lat: number, _lng: number): Promise<{ status: "NOT_AVAILABLE"; reason: string }>;
};

export const NoOpConditionsProvider: ConditionsProvider = {
  id: "noop",
  async getConditions() {
    return { status: "NOT_AVAILABLE", reason: "Weather provider not connected" };
  },
};
