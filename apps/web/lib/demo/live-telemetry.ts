"use client";

import { useEffect, useState } from "react";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";

export const SPORT_FILTERS = ["Run", "Ride", "Swim", "Yoga"] as const;
export type SportFilter = (typeof SPORT_FILTERS)[number];

const LISBON = { lat: 38.7223, lng: -9.1393 };

/**
 * Shared by SSR and the first client paint. Never seed with Date.now() —
 * that is what caused "Server: 84 / Client: 85" hydration mismatches.
 */
export const LIVE_TELEMETRY_SSR_SEED = 0;

/** LOCAL_DEMO path around Lisbon — not hardware GPS. */
export function liveAthletePosition(nowMs: number) {
  const t = nowMs / 4200;
  return {
    lat: LISBON.lat + Math.sin(t) * 0.016,
    lng: LISBON.lng + Math.cos(t) * 0.02
  };
}

export function liveDemoMetrics(nowMs: number) {
  const wave = Math.sin(nowMs / 1800);
  return {
    hrvMs: Math.round(68 + wave * 5),
    hrBpm: Math.round(138 + wave * 9),
    load: Number((0.82 + wave * 0.05).toFixed(2)),
    readiness: Math.round(85 + wave * 2)
  };
}

export function hotspotMatchesFilter(sport: string | undefined, filter: string | null): boolean {
  if (!filter) return true;
  if (!sport) return false;
  const s = sport.toLowerCase();
  const f = filter.toLowerCase();
  if (f === "run") return s.includes("run");
  if (f === "ride") return s.includes("cycl") || s.includes("ride");
  if (f === "swim") return s.includes("swim");
  if (f === "yoga") return s.includes("yoga");
  return s.includes(f);
}

export function useLiveDemoTelemetry() {
  const [now, setNow] = useState(LIVE_TELEMETRY_SSR_SEED);

  useEffect(() => {
    if (shouldReduceMotion()) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 900);
    return () => window.clearInterval(id);
  }, []);

  const metrics = liveDemoMetrics(now);
  const position = liveAthletePosition(now);
  return { ...metrics, ...position, now };
}
