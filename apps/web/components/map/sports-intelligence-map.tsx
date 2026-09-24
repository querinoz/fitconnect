"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Source, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyleUrl } from "@fitconnect/maps";
import { cn } from "@/lib/utils";
import { listSportGroups } from "@/lib/sport-intelligence/sport-registry";
import type { SpotKind, SpotSummary, SkillLevel } from "@/lib/spots/types";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { EliteButton } from "@/components/elite-os/elite-button";
import { ZenithGlass } from "@/components/elite-os/zenith-glass";

type LocationState =
  | "LOCATION_LOADING"
  | "LOCATION_AVAILABLE"
  | "LOCATION_DENIED"
  | "LOCATION_UNAVAILABLE";

type ViewMode = "MAP" | "LIST";

const DEFAULT_VIEW = { latitude: 38.7223, longitude: -9.1393, zoom: 11.2 };

function markerGlyph(kind: SpotKind): string {
  if (kind === "MASTER") return "★";
  if (kind === "SECRET") return "◇";
  return "●";
}

function markerLabel(kind: SpotKind): string {
  if (kind === "MASTER") return "Master spot";
  if (kind === "SECRET") return "Secret spot (approx)";
  return "Standard spot";
}

export function SportsIntelligenceMap({
  className,
  height = "min(72vh, 640px)",
}: {
  className?: string;
  height?: number | string;
}) {
  const mapStyle = getMapStyleUrl();
  const mapRef = useRef<MapRef>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [spots, setSpots] = useState<SpotSummary[]>([]);
  const [source, setSource] = useState<"postgres" | "unavailable" | "empty" | "loading">("loading");
  const [kind, setKind] = useState<SpotKind | "ALL">("ALL");
  const [skill, setSkill] = useState<SkillLevel | "ALL">("ALL");
  const [sportGroup, setSportGroup] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [selected, setSelected] = useState<SpotSummary | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("MAP");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<LocationState>("LOCATION_UNAVAILABLE");
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [routeStatus, setRouteStatus] = useState<string | null>(null);
  const [routeLine, setRouteLine] = useState<{
    type: "FeatureCollection";
    features: Array<{ type: "Feature"; properties: Record<string, never>; geometry: { type: "LineString"; coordinates: number[][] } }>;
  } | null>(null);

  const groups = useMemo(() => listSportGroups(), []);
  const sportsInGroup = useMemo(() => {
    if (!sportGroup) return [];
    return groups.find((g) => g.id === sportGroup)?.sports ?? [];
  }, [groups, sportGroup]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  const fetchSpots = useCallback(
    (bbox?: { west: number; south: number; east: number; north: number }) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setSource("loading");
      const params = new URLSearchParams();
      if (bbox) {
        params.set("west", String(bbox.west));
        params.set("south", String(bbox.south));
        params.set("east", String(bbox.east));
        params.set("north", String(bbox.north));
      }
      if (userPos) {
        params.set("lat", String(userPos.lat));
        params.set("lng", String(userPos.lng));
      }
      if (sport) params.set("sport", sport);
      if (kind !== "ALL") params.set("kind", kind);
      if (skill !== "ALL") params.set("skill", skill);
      params.set("limit", "100");

      fetch(`/api/v1/spots?${params}`, { signal: ac.signal, credentials: "include" })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<{
            spots: SpotSummary[];
            source: "postgres" | "unavailable" | "empty";
          }>;
        })
        .then((data) => {
          setSpots(data.spots ?? []);
          setSource(data.source ?? "empty");
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setSpots([]);
          setSource("unavailable");
        });
    },
    [kind, skill, sport, userPos]
  );

  const scheduleFetchFromMap = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) {
        fetchSpots();
        return;
      }
      const b = map.getBounds();
      fetchSpots({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      });
    }, 350);
  }, [fetchSpots]);

  useEffect(() => {
    scheduleFetchFromMap();
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [scheduleFetchFromMap]);

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
    if (!navigator.geolocation) {
      setLocState("LOCATION_UNAVAILABLE");
      return;
    }
    setLocState("LOCATION_LOADING");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(next);
        setLocState("LOCATION_AVAILABLE");
        mapRef.current?.flyTo({ center: [next.lng, next.lat], zoom: 12.5, duration: 800 });
      },
      () => setLocState("LOCATION_DENIED"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const runSearch = async () => {
    const q = searchQ.trim();
    if (q.length < 2) return;
    setSearchStatus("LOADING");
    try {
      const res = await fetch(`/api/v1/geo?action=geocode&q=${encodeURIComponent(q)}`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        status: string;
        results: Array<{ label: string; lat: number; lng: number }>;
      };
      setSearchStatus(data.status);
      setSearchResults(data.results ?? []);
      if (data.results?.[0]) {
        mapRef.current?.flyTo({
          center: [data.results[0].lng, data.results[0].lat],
          zoom: 13,
          duration: 700,
        });
      }
    } catch {
      setSearchStatus("ERROR");
      setSearchResults([]);
    }
  };

  const requestRoute = async (mode: "walk" | "bike" | "drive") => {
    if (!userPos || !selected) {
      setRouteStatus("UNAVAILABLE");
      return;
    }
    setRouteStatus("LOADING");
    setRouteLine(null);
    const params = new URLSearchParams({
      action: "route",
      fromLat: String(userPos.lat),
      fromLng: String(userPos.lng),
      toLat: String(selected.approxLat),
      toLng: String(selected.approxLng),
      mode,
    });
    try {
      const res = await fetch(`/api/v1/geo?${params}`, { credentials: "include" });
      const data = (await res.json()) as {
        status: string;
        route: {
          distanceM: number;
          durationSec: number;
          geometry: { type: "LineString"; coordinates: number[][] } | null;
        } | null;
        message?: string;
      };
      setRouteStatus(data.status);
      if (data.route?.geometry) {
        setRouteLine({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: data.route.geometry }],
        });
      }
    } catch {
      setRouteStatus("ERROR");
    }
  };

  const clusterGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: spots.map((s) => ({
        type: "Feature" as const,
        properties: {
          id: s.id,
          kind: s.spotKind,
          name: s.name,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [s.approxLng, s.approxLat],
        },
      })),
    }),
    [spots]
  );

  return (
    <div className={cn("flex flex-col gap-3", className)} data-testid="sports-intelligence-map">
      <ZenithGlass intensity="subtle" padding="sm" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <EliteButton variant="secondary" onClick={locate} aria-label="Near me">
            Near me
          </EliteButton>
          <div className="flex min-w-[12rem] flex-1 gap-2">
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void runSearch()}
              placeholder="Search place"
              aria-label="Search place"
              className="w-full rounded-xl border border-eos-outline bg-eos-floor/60 px-3 py-2 text-sm text-eos-ink"
            />
            <EliteButton variant="secondary" onClick={() => void runSearch()} aria-label="Run search">
              Search
            </EliteButton>
          </div>
          <EliteChip
            tone={viewMode === "MAP" ? "volt" : "neutral"}
            onClick={() => setViewMode("MAP")}
          >
            Map
          </EliteChip>
          <EliteChip
            tone={viewMode === "LIST" ? "volt" : "neutral"}
            onClick={() => setViewMode("LIST")}
          >
            List
          </EliteChip>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Spot type">
          {(["ALL", "STANDARD", "MASTER", "SECRET"] as const).map((k) => (
            <EliteChip
              key={k}
              tone={kind === k ? "iris" : "neutral"}
              onClick={() => setKind(k)}
            >
              {k === "ALL" ? "All types" : k}
            </EliteChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Skill level">
          {(["ALL", "BEGINNER", "AMATEUR", "ADVANCED", "PROFESSIONAL"] as const).map((s) => (
            <EliteChip
              key={s}
              tone={skill === s ? "telemetry" : "neutral"}
              onClick={() => setSkill(s)}
            >
              {s === "ALL" ? "All levels" : s}
            </EliteChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Sport group">
          {groups.map((g) => (
            <EliteChip
              key={g.id}
              tone={sportGroup === g.id ? "volt" : "neutral"}
              onClick={() => {
                setSportGroup(g.id === sportGroup ? null : g.id);
                setSport(null);
              }}
            >
              {g.label}
            </EliteChip>
          ))}
        </div>
        {sportsInGroup.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Sport">
            {sportsInGroup.map((s) => (
              <EliteChip
                key={s.id}
                tone={sport === s.id ? "iris" : "neutral"}
                onClick={() => setSport(sport === s.id ? null : s.id)}
              >
                {s.label}
              </EliteChip>
            ))}
          </div>
        ) : null}

        {locState === "LOCATION_DENIED" ? (
          <p className="text-sm text-eos-ink/70">
            Enable location to discover spots near you. You can still search and pan the map.
          </p>
        ) : null}
        {searchStatus === "NOT_CONFIGURED" || searchStatus === "QUOTA_EXHAUSTED" ? (
          <p className="text-sm text-eos-ink/70">
            Place search {searchStatus === "QUOTA_EXHAUSTED" ? "quota exhausted" : "not configured"} — map still works.
          </p>
        ) : null}
        {source === "unavailable" ? (
          <p className="text-sm text-eos-alert">Spot data UNAVAILABLE — database not connected.</p>
        ) : null}
        {source === "empty" && kind !== "SECRET" ? (
          <p className="text-sm text-eos-ink/70">No public spots in this area yet.</p>
        ) : null}
        {kind === "SECRET" ? (
          <p className="text-sm text-eos-ink/70">
            Secret spots never appear on the public map. Exact locations stay owner-only.
          </p>
        ) : null}
      </ZenithGlass>

      {viewMode === "LIST" ? (
        <ul className="space-y-2" aria-label="Spot list">
          {spots.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="w-full rounded-2xl border border-eos-outline bg-eos-elevation-1 p-4 text-left"
                onClick={() => setSelected(s)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span aria-hidden>{markerGlyph(s.spotKind)}</span>
                </div>
                <p className="mt-1 text-sm text-eos-ink/65">
                  {s.sportKey}
                  {s.skillLevel ? ` · ${s.skillLevel}` : ""}
                  {s.certificationStatus === "MASTER" ? " · VERIFIED" : ""}
                  {s.distanceM != null ? ` · ${Math.round(s.distanceM / 100) / 10} km` : ""}
                </p>
                {s.ratingAvg == null ? (
                  <p className="mt-1 text-xs text-eos-ink/50">Rating UNAVAILABLE</p>
                ) : (
                  <p className="mt-1 text-xs text-eos-ink/50">
                    ★ {s.ratingAvg.toFixed(1)} ({s.reviewCount})
                  </p>
                )}
              </button>
            </li>
          ))}
          {spots.length === 0 ? (
            <li className="text-sm text-eos-ink/60">No spots to list.</li>
          ) : null}
        </ul>
      ) : (
        <div
          ref={wrapRef}
          className="relative w-full min-w-0 overflow-hidden rounded-[var(--eos-radius-card)] border border-eos-outline"
          style={{ height: heightStyle, minHeight: 320 }}
        >
          <Map
            ref={mapRef}
            initialViewState={DEFAULT_VIEW}
            mapStyle={mapStyle}
            attributionControl={{ compact: true }}
            style={{ width: "100%", height: "100%" }}
            onLoad={(e) => {
              e.target.resize();
              scheduleFetchFromMap();
            }}
            onMoveEnd={scheduleFetchFromMap}
          >
            <NavigationControl position="top-right" showCompass={false} />
            <Source
              id="spots-cluster"
              type="geojson"
              data={clusterGeoJson}
              cluster
              clusterMaxZoom={14}
              clusterRadius={48}
            >
              <Layer
                id="clusters"
                type="circle"
                filter={["has", "point_count"]}
                paint={{
                  "circle-color": "#6C63FF",
                  "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 30, 28],
                  "circle-opacity": 0.85,
                }}
              />
              <Layer
                id="cluster-count"
                type="symbol"
                filter={["has", "point_count"]}
                layout={{
                  "text-field": "{point_count_abbreviated}",
                  "text-size": 12,
                }}
                paint={{ "text-color": "#070B14" }}
              />
            </Source>
            {routeLine ? (
              <Source id="route" type="geojson" data={routeLine}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    "line-color": "#C8FF00",
                    "line-width": 3,
                    "line-opacity": 0.9,
                  }}
                />
              </Source>
            ) : null}
            {spots.map((s) => (
              <Marker
                key={s.id}
                latitude={s.approxLat}
                longitude={s.approxLng}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(s);
                }}
              >
                <button
                  type="button"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow-lg",
                    s.spotKind === "MASTER" && "border-[#C8FF00] bg-[#070B14] text-[#C8FF00]",
                    s.spotKind === "STANDARD" && "border-[#3CD7FF]/60 bg-[#070B14]/90 text-[#3CD7FF]",
                    s.spotKind === "SECRET" && "border-[#6C63FF] bg-[#070B14] text-[#6C63FF]"
                  )}
                  aria-label={`${markerLabel(s.spotKind)}: ${s.name}`}
                >
                  <span aria-hidden>{markerGlyph(s.spotKind)}</span>
                </button>
              </Marker>
            ))}
            {userPos ? (
              <Marker latitude={userPos.lat} longitude={userPos.lng} anchor="center">
                <span
                  className="block h-3 w-3 rounded-full bg-[#C8FF00] ring-4 ring-[#C8FF00]/30"
                  aria-label="Your location"
                />
              </Marker>
            ) : null}
          </Map>
        </div>
      )}

      {selected ? (
        <ZenithGlass intensity="standard" floating className="space-y-3" data-testid="spot-detail">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eos-label-caps opacity-60">
                {selected.spotKind}
                {selected.certificationStatus === "MASTER" ? " · FITCONNECT VERIFIED" : ""}
              </p>
              <h2 className="text-xl font-semibold text-eos-ink">{selected.name}</h2>
              <p className="text-sm text-eos-ink/70">
                {selected.sportKey}
                {selected.skillLevel ? ` · ${selected.skillLevel}` : ""}
                {selected.region ? ` · ${selected.region}` : ""}
              </p>
            </div>
            <EliteButton variant="ghost" onClick={() => setSelected(null)} aria-label="Close spot detail">
              Close
            </EliteButton>
          </div>
          {selected.ratingAvg == null ? (
            <p className="text-sm text-eos-ink/60">Rating UNAVAILABLE</p>
          ) : (
            <p className="text-sm">★ {selected.ratingAvg.toFixed(1)} · {selected.reviewCount} reviews</p>
          )}
          {selected.accessWarning ? (
            <p className="text-sm text-eos-recovery">{selected.accessWarning}</p>
          ) : null}
          {selected.permissionRequired ? (
            <p className="text-sm text-eos-ink/70">Permission required to access this location.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <EliteButton
              variant="secondary"
              disabled={!userPos}
              onClick={() => void requestRoute("walk")}
            >
              Route · Walk
            </EliteButton>
            <EliteButton
              variant="secondary"
              disabled={!userPos}
              onClick={() => void requestRoute("bike")}
            >
              Bike
            </EliteButton>
            <EliteButton
              variant="secondary"
              disabled={!userPos}
              onClick={() => void requestRoute("drive")}
            >
              Drive
            </EliteButton>
          </div>
          {routeStatus && routeStatus !== "AVAILABLE" ? (
            <p className="text-sm text-eos-ink/60">Routing {routeStatus}</p>
          ) : null}
          {!userPos ? (
            <p className="text-xs text-eos-ink/50">Enable location to request a route.</p>
          ) : null}
        </ZenithGlass>
      ) : null}

      {searchResults.length > 0 ? (
        <ul className="sr-only" aria-live="polite">
          {searchResults.map((r) => (
            <li key={`${r.lat}-${r.lng}`}>{r.label}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
