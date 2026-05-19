"use client";

import { useMemo } from "react";
import { decodePolyline } from "@fitconnect/strava-integration";
import { cn } from "@/lib/utils";

type Props = {
  polyline?: string | null;
  className?: string;
  stroke?: string;
};

/** Lightweight SVG route preview — no external map SDK required. */
export function StravaActivityMap({ polyline, className, stroke = "#FC5200" }: Props) {
  const path = useMemo(() => {
    if (!polyline) return null;
    const coords = decodePolyline(polyline);
    if (coords.length < 2) return null;

    const lats = coords.map((c) => c[0]);
    const lngs = coords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const w = 280;
    const h = 120;
    const pad = 8;

    const scaleX = (lng: number) =>
      pad + ((lng - minLng) / (maxLng - minLng || 1)) * (w - pad * 2);
    const scaleY = (lat: number) =>
      h - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (h - pad * 2);

    return coords
      .map(([lat, lng], i) => `${i === 0 ? "M" : "L"}${scaleX(lng).toFixed(1)},${scaleY(lat).toFixed(1)}`)
      .join(" ");
  }, [polyline]);

  if (!path) {
    return (
      <div
        className={cn(
          "flex h-[120px] items-center justify-center rounded-2xl border border-glass-border bg-ink-950/60 text-xs text-ink-500",
          className
        )}
      >
        No GPS route
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <svg
        viewBox="0 0 280 120"
        className={cn(
          "h-[120px] w-full rounded-2xl border border-brand-500/20 bg-gradient-to-br from-ink-950 to-ink-900",
          className
        )}
        aria-hidden
      >
      <defs>
        <linearGradient id="strava-route-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FC5200" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="url(#strava-route-glow)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
      <circle cx="4" cy="4" r="3" fill={stroke} opacity={0.35} />
      </svg>
      <p className="text-[9px] text-ink-500 text-right pr-1">Powered by Strava</p>
    </div>
  );
}
