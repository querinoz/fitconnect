"use client";

import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/ui-glass/premium-system";

const FitConnectMap = dynamic(
  () => import("@/components/map/fit-connect-map").then((m) => m.FitConnectMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70dvh,560px)] animate-pulse rounded-3xl bg-ink-900/60" aria-hidden />
    )
  }
);

export function MapHeroSection() {
  return (
    <section id="map-hero" className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeader
        eyebrow="Live map"
        title={
          <>
            Your world. <span className="gradient-text">In motion.</span>
          </>
        }
        body="Heatmap of Strava routes, training spots, events and coaches near you — dark Voltline style."
      />
      <div className="mt-10">
        <FitConnectMap mode="landing" height="min(70dvh, 560px)" />
      </div>
    </section>
  );
}
