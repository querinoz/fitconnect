"use client";

import dynamic from "next/dynamic";
import { useLocale } from "@/lib/i18n-provider";

const FitConnectMap = dynamic(
  () => import("@/components/map/fit-connect-map").then((m) => m.FitConnectMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(70dvh,520px)] min-h-[280px] w-full animate-pulse rounded-3xl border border-white/10 bg-eos-floor" aria-hidden />
    )
  }
);

export function MapHeroSection() {
  const copy = useLocale().landingV2.map;

  return (
    <section id="map-hero" className="mx-auto w-full min-w-0 max-w-[1440px] overflow-x-clip px-4 py-16 sm:px-6 sm:py-24">
      <p className="eos-label-caps text-eos-voltline">{copy.eyebrow}</p>
      <h2 className="mt-3 max-w-full font-display text-[clamp(1.8rem,5vw,3.4rem)] font-extrabold leading-[0.92] tracking-tight text-eos-on-surface">
        {copy.title}{" "}
        <span className="text-eos-voltline">{copy.titleAccent}</span>
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-eos-on-surface-muted sm:text-base">
        {copy.body}
      </p>
      <div className="mt-8 w-full min-w-0">
        <FitConnectMap mode="landing" height="min(70dvh, 520px)" />
      </div>
    </section>
  );
}
