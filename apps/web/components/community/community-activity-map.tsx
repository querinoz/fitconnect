"use client";

import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/observability/posthog";
import { useEffect } from "react";

const FitConnectMap = dynamic(
  () => import("@/components/map/fit-connect-map").then((m) => m.FitConnectMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[280px] animate-pulse rounded-2xl bg-ink-900/60" aria-hidden />
    )
  }
);

/** Community activity heatmap — OpenFreeMap + MapLibre (no API key). */
export function CommunityActivityMap() {
  useEffect(() => {
    trackEvent("community_map_view", { provider: "openfreemap" });
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-950/60">
      <FitConnectMap mode="community" height={320} />
      <p className="relative border-t border-ink-800 px-4 py-2 text-[10px] uppercase tracking-widest text-ink-500">
        OpenFreeMap · community hotspots
      </p>
    </div>
  );
}
