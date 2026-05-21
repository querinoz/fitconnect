export type ActivityHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  sport: string;
};

export const DEMO_HOTSPOTS: ActivityHotspot[] = [
  { id: "lisbon-riverside", name: "Lisbon riverside", lat: 38.707, lng: -9.136, intensity: 0.92, sport: "Running" },
  { id: "ericeira-surf", name: "Ericeira surf break", lat: 38.962, lng: -9.415, intensity: 0.78, sport: "Surf" },
  { id: "sintra-trails", name: "Sintra trails", lat: 38.799, lng: -9.388, intensity: 0.85, sport: "Running" },
  { id: "cascais-coast", name: "Cascais coastal ride", lat: 38.697, lng: -9.421, intensity: 0.71, sport: "Cycling" },
  { id: "innsbruck-alps", name: "Innsbruck alpine", lat: 47.269, lng: 11.404, intensity: 0.88, sport: "Climbing" }
];

/** OpenFreeMap vector styles — free, no API key. https://openfreemap.org */
export const OPENFREEMAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  positron: "https://tiles.openfreemap.org/styles/positron",
  bright: "https://tiles.openfreemap.org/styles/bright",
  fiord: "https://tiles.openfreemap.org/styles/fiord"
} as const;

export const DEFAULT_MAP_STYLE = OPENFREEMAP_STYLES.dark;

export function getMapStyleUrl(): string {
  const custom =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ||
    process.env.EXPO_PUBLIC_MAP_STYLE_URL?.trim();
  return custom || DEFAULT_MAP_STYLE;
}

export function isMapConfigured(): boolean {
  return true;
}

/** @deprecated Maps use OpenFreeMap — no token required. */
export function isMapboxConfigured(): boolean {
  return isMapConfigured();
}

export function hotspotsToGeoJson(hotspots: ActivityHotspot[]) {
  return {
    type: "FeatureCollection" as const,
    features: hotspots.map((h) => ({
      type: "Feature" as const,
      properties: {
        id: h.id,
        name: h.name,
        intensity: h.intensity,
        sport: h.sport
      },
      geometry: {
        type: "Point" as const,
        coordinates: [h.lng, h.lat]
      }
    }))
  };
}
