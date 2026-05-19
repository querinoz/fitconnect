"use client";

import dynamic from "next/dynamic";
import { HeroDeviceGate } from "./hero-device-gate";
import { useLocale } from "@/lib/i18n-provider";

const HeroMetrics = dynamic(
  () =>
    import("./hero-metrics-deferred").then((m) => m.HeroMetricsDeferred),
  { ssr: false, loading: () => <div className="mt-6 h-20" aria-hidden /> }
);

export function HeroExtras() {
  const x = useLocale().heroExtras;

  return (
    <div className="relative w-full min-w-0 lg:max-w-[420px] lg:justify-self-end xl:max-w-[440px]">
      <div className="w-full min-w-0 space-y-4 fc-hero-mockup-enter lg:space-y-5">
        <HeroMetrics />

        <div className="relative w-full min-w-0">
          <HeroDeviceGate className="relative w-full min-w-0" />

          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&q=65&auto=format&fit=crop"
            sport={x.sportStrength}
            position="top-left"
            anim="fc-photo-float-a"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=320&q=65&auto=format&fit=crop"
            sport={x.sportYoga}
            position="bottom-right"
            anim="fc-photo-float-b"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=320&q=65&auto=format&fit=crop"
            sport={x.sportRunning}
            position="middle-right"
            anim="fc-photo-float-c"
          />
        </div>
      </div>
    </div>
  );
}

type FloatingCoachPhotoProps = {
  src: string;
  sport: string;
  position: "top-left" | "bottom-right" | "middle-right";
  anim: "fc-photo-float-a" | "fc-photo-float-b" | "fc-photo-float-c";
};

function FloatingCoachPhoto({ src, sport, position, anim }: FloatingCoachPhotoProps) {
  const positionClass =
    position === "top-left"
      ? "top-0 left-0 z-[8] hidden md:block md:-left-6 lg:-left-8"
      : position === "bottom-right"
        ? "bottom-12 right-0 z-[8] hidden md:block md:-right-4"
        : "top-[18%] right-0 z-[8] hidden xl:block xl:-right-10";

  return (
    <figure
      aria-hidden="true"
      className={`pointer-events-none absolute ${positionClass} w-24 lg:w-28 ${anim}`}
    >
      <div className="relative overflow-hidden rounded-[1.25rem] border border-ink-700/80 bg-ink-950 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7),0_0_24px_-8px_var(--volt-glow)] fc-photo-mask ring-1 ring-white/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          width={320}
          height={224}
          className="h-20 w-full object-cover lg:h-24"
        />
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
          <span className="h-5 w-5 rounded-full ring-2 ring-ink-950 bg-gradient-to-br from-volt-500 to-brand-400" />
          <span className="text-[9px] font-semibold text-ink-50 leading-tight truncate">
            {sport}
          </span>
        </div>
      </div>
    </figure>
  );
}
