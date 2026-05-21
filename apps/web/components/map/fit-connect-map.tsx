"use client";

import { useMemo, useState } from "react";
import Map, { Layer, Source, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { DEMO_HOTSPOTS, getMapStyleUrl } from "@fitconnect/maps";

export type MapPointType =
  | "activity_route"
  | "event"
  | "training_spot"
  | "secret_spot"
  | "coach"
  | "athlete_live"
  | "strava_segment";

export interface MapPoint {
  id: string;
  type: MapPointType;
  lat: number;
  lng: number;
  title: string;
  sport?: string;
}

export type FitConnectMapMode = "landing" | "athlete" | "coach" | "community";

const DEFAULT_VIEW = {
  latitude: 38.7223,
  longitude: -9.1393,
  zoom: 11
};

function hashCount(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h + label.charCodeAt(i) * 17) % 997;
  return 100 + (h % 900);
}

export function FitConnectMap({
  mode = "landing",
  className,
  height = 420,
  sportFilter
}: {
  mode?: FitConnectMapMode;
  className?: string;
  height?: number | string;
  sportFilter?: string | null;
}) {
  const mapStyle = getMapStyleUrl();
  const [filter, setFilter] = useState<string | null>(sportFilter ?? null);

  const points: MapPoint[] = useMemo(
    () =>
      DEMO_HOTSPOTS.map((h, i) => ({
        id: `hotspot-${i}`,
        type: (i % 3 === 0 ? "coach" : i % 3 === 1 ? "training_spot" : "event") as MapPointType,
        lat: h.lat,
        lng: h.lng,
        title: h.name,
        sport: h.sport
      })),
    []
  );

  const filtered = filter
    ? points.filter((p) => !p.sport || p.sport.toLowerCase().includes(filter.toLowerCase()))
    : points;

  const heatmapGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: filtered.map((p) => ({
        type: "Feature" as const,
        properties: { intensity: hashCount(p.id) / 1000 },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] }
      }))
    }),
    [filtered]
  );

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-ink-800", className)} style={{ height }}>
      <Map
        initialViewState={DEFAULT_VIEW}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="heatmap" type="geojson" data={heatmapGeoJson}>
          <Layer
            id="heatmap-layer"
            type="heatmap"
            paint={{
              "heatmap-weight": ["get", "intensity"],
              "heatmap-intensity": 1,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(200,255,0,0)",
                0.5,
                "rgba(200,255,0,0.45)",
                1,
                "rgba(200,255,0,0.85)"
              ],
              "heatmap-radius": mode === "landing" ? 28 : 40
            }}
          />
        </Source>

        {filtered.slice(0, 12).map((p) => (
          <Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="bottom">
            <div
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-semibold shadow-lg",
                p.type === "coach"
                  ? "bg-volt-500 text-ink-950"
                  : "bg-ink-800/90 text-ink-100 border border-glass-border"
              )}
              title={p.title}
            >
              {p.title.split(" ")[0]}
            </div>
          </Marker>
        ))}
      </Map>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
        {["Run", "Ride", "Swim", "Yoga"].map((sport) => (
          <button
            key={sport}
            type="button"
            onClick={() => setFilter((f) => (f === sport ? null : sport))}
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold lowercase backdrop-blur",
              filter === sport
                ? "bg-volt-500 text-ink-950"
                : "bg-ink-900/80 text-ink-300 border border-glass-border"
            )}
          >
            {sport}
          </button>
        ))}
      </div>
    </div>
  );
}
