"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { DEMO_HOTSPOTS, getMapStyleUrl } from "@fitconnect/maps";
import {
  SPORT_FILTERS,
  hotspotMatchesFilter,
  useLiveDemoTelemetry
} from "@/lib/demo/live-telemetry";
import { useLocale } from "@/lib/i18n-provider";

export type FitConnectMapMode = "landing" | "athlete" | "coach" | "community";

const DEFAULT_VIEW = {
  latitude: 38.7223,
  longitude: -9.1393,
  zoom: 11.4
};

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
  const live = useLiveDemoTelemetry();
  const demoBadge = useLocale().landingEditorial.heroElite.demoBadge;
  const copy = useLocale().landingV2.map;
  const [filter, setFilter] = useState<string | null>(sportFilter ?? null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<MapRef>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const points = useMemo(
    () =>
      DEMO_HOTSPOTS.filter((h) => hotspotMatchesFilter(h.sport, filter)).map((h) => ({
        id: h.id,
        lat: h.lat,
        lng: h.lng,
        title: h.name,
        sport: h.sport
      })),
    [filter]
  );

  const heatmapGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: points.map((p) => ({
        type: "Feature" as const,
        properties: { intensity: 0.7 },
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] }
      }))
    }),
    [points]
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const resize = () => mapRef.current?.getMap()?.resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const t = window.setTimeout(resize, 80);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(next);
        mapRef.current?.flyTo({ center: [next.lng, next.lat], zoom: 12, duration: 900 });
      },
      () => {
        /* permission denied — keep Lisbon demo stream */
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const heightStyle =
    typeof height === "number" ? `${height}px` : height;

  return (
    <div
      ref={wrapRef}
      data-testid="fit-connect-map"
      className={cn(
        "relative w-full min-w-0 overflow-hidden rounded-3xl border border-white/10",
        className
      )}
      style={{ height: heightStyle, minHeight: 280 }}
    >
      <Map
        ref={mapRef}
        initialViewState={DEFAULT_VIEW}
        mapStyle={mapStyle}
        attributionControl={{ compact: true }}
        cooperativeGestures={mode === "landing"}
        style={{ width: "100%", height: "100%" }}
        onLoad={(event) => event.target.resize()}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source id="heatmap" type="geojson" data={heatmapGeoJson}>
          <Layer
            id="heatmap-layer"
            type="heatmap"
            paint={{
              "heatmap-weight": 0.65,
              "heatmap-intensity": 0.85,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(200,255,0,0)",
                0.45,
                "rgba(60,215,255,0.28)",
                1,
                "rgba(200,255,0,0.7)"
              ],
              "heatmap-radius": mode === "landing" ? 22 : 32,
              "heatmap-opacity": 0.45
            }}
          />
        </Source>

        {points.slice(0, 12).map((p) => (
          <Marker key={p.id} latitude={p.lat} longitude={p.lng} anchor="bottom">
            <div
              className="max-w-[9rem] truncate rounded-full border border-white/15 bg-[color-mix(in_srgb,var(--eos-floor)_82%,transparent)] px-2 py-1 font-mono text-[10px] font-semibold text-eos-on-surface shadow-lg"
              title={p.title}
            >
              {p.title.split(" ")[0]}
            </div>
          </Marker>
        ))}

        <Marker latitude={live.lat} longitude={live.lng} anchor="center">
          <div
            data-testid="live-demo-athlete"
            className="relative flex h-4 w-4 items-center justify-center"
          >
            <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-eos-voltline/50 motion-reduce:animate-none" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-eos-voltline" />
          </div>
        </Marker>

        {userPos ? (
          <Marker latitude={userPos.lat} longitude={userPos.lng} anchor="bottom">
            <div className="rounded-full bg-eos-telemetry px-2 py-1 font-mono text-[10px] font-bold text-eos-floor">
              {copy.you}
            </div>
          </Marker>
        ) : null}
      </Map>

      <div className="pointer-events-none absolute left-3 top-3 flex max-w-[calc(100%-5.5rem)] flex-col gap-2">
        <span className="pointer-events-auto w-fit rounded-full border border-eos-voltline/30 bg-[color-mix(in_srgb,var(--eos-floor)_78%,transparent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-eos-voltline">
          {demoBadge} · {live.hrBpm} bpm
        </span>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap gap-2">
          {SPORT_FILTERS.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => setFilter((f) => (f === sport ? null : sport))}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[10px] font-semibold lowercase backdrop-blur",
                filter === sport
                  ? "bg-eos-voltline text-eos-floor"
                  : "border border-white/10 bg-[color-mix(in_srgb,var(--eos-floor)_80%,transparent)] text-eos-on-surface-muted"
              )}
            >
              {sport}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={locate}
          className="rounded-full border border-eos-telemetry/30 bg-[color-mix(in_srgb,var(--eos-floor)_80%,transparent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-eos-telemetry"
        >
          {copy.locate}
        </button>
      </div>
    </div>
  );
}
