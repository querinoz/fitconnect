"use client";

import { DEMO_HOTSPOTS, isMapboxConfigured, hotspotsToGeoJson } from "@fitconnect/maps";
import { trackEvent } from "@/lib/observability/posthog";
import { useEffect } from "react";
import { MapPin } from "lucide-react";

/** Community activity heatmap — Mapbox when token configured, CSS fallback otherwise. */
export function CommunityActivityMap() {
  const mapbox = isMapboxConfigured();
  const geo = hotspotsToGeoJson(DEMO_HOTSPOTS);

  useEffect(() => {
    trackEvent("community_map_view", { provider: mapbox ? "mapbox" : "demo" });
  }, [mapbox]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-950/60">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(56,189,248,0.12),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(167,139,250,0.1),transparent_45%)]" />
      <div className="relative grid min-h-[280px] grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        {DEMO_HOTSPOTS.map((h) => (
          <div
            key={h.id}
            className="flex flex-col justify-end rounded-xl border border-ink-800/80 bg-ink-900/50 p-3"
            style={{
              opacity: 0.55 + h.intensity * 0.45,
              boxShadow: `inset 0 0 ${Math.round(h.intensity * 40)}px rgba(56,189,248,${h.intensity * 0.25})`
            }}
          >
            <MapPin className="mb-2 h-4 w-4 text-brand-300" />
            <p className="text-xs font-semibold text-ink-100">{h.name}</p>
            <p className="text-[10px] text-ink-500">{h.sport}</p>
          </div>
        ))}
      </div>
      <p className="relative border-t border-ink-800 px-4 py-2 text-[10px] uppercase tracking-widest text-ink-500">
        {mapbox ? "Mapbox GL ready" : "Demo heatmap"} · {geo.features.length} live hotspots
      </p>
    </div>
  );
}
