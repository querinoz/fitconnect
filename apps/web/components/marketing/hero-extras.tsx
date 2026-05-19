"use client";

import dynamic from "next/dynamic";
import { HeroDeviceGate } from "./hero-device-gate";

const HeroMetrics = dynamic(
  () =>
    import("./hero-metrics-deferred").then((m) => m.HeroMetricsDeferred),
  { ssr: false, loading: () => <div className="mt-10 h-24" aria-hidden /> }
);

export function HeroExtras() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 lg:absolute lg:inset-y-0 lg:right-0 lg:flex lg:max-w-none lg:items-center lg:pb-0 lg:pl-[50%] lg:pr-6">
      <div className="w-full space-y-5 fc-hero-mockup-enter">
        <HeroMetrics />

        <div className="relative flex min-h-[280px] items-center sm:min-h-[360px] lg:min-h-[560px]">
          <HeroDeviceGate className="relative z-20 w-full" />

          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&q=65&auto=format&fit=crop"
            sport="Strength"
            position="top-left"
            anim="fc-photo-float-a"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=320&q=65&auto=format&fit=crop"
            sport="Yoga"
            position="bottom-right"
            anim="fc-photo-float-b"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=320&q=65&auto=format&fit=crop"
            sport="Running"
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
      ? "top-4 left-0 z-[8] hidden md:block md:-left-6 lg:-left-10 xl:-left-14"
      : position === "bottom-right"
        ? "bottom-24 right-0 z-[8] hidden md:block md:-right-4 lg:-right-8 xl:-right-10"
        : "top-[20%] right-0 z-[8] hidden xl:block xl:-right-16";

  return (
    <figure
      aria-hidden="true"
      className={`absolute ${positionClass} w-32 lg:w-36 ${anim}`}
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
          className="h-28 w-full object-cover"
        />
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full ring-2 ring-ink-950 bg-gradient-to-br from-volt-500 to-brand-400" />
          <span className="text-[10px] font-semibold text-ink-50 leading-tight truncate">
            {sport}
          </span>
        </div>
      </div>
    </figure>
  );
}
