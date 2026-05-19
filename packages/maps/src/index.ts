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

export function isMapboxConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim());
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
