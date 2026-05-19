"use client";

import { Laptop, Smartphone, Watch } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IphoneFrame } from "./iphone-frame";
import { GalaxyWatchFrame } from "./galaxy-watch-frame";
import { LaptopFrame } from "./laptop-frame";
import { MobileAppPreview } from "@/components/dashboard/mobile-app-preview";
import { ReadinessRing } from "@/components/ui-glass/readiness-ring";
import { StravaBrandedCard } from "@/components/sharing/strava-branded-card";

type DeviceId = "iphone" | "watch" | "laptop";

const DEVICES: {
  id: DeviceId;
  label: string;
  icon: typeof Smartphone;
}[] = [
  { id: "iphone", label: "iPhone 17", icon: Smartphone },
  { id: "watch", label: "Apple Watch Ultra", icon: Watch },
  { id: "laptop", label: "MacBook", icon: Laptop }
];

const SCREEN_H = "h-[420px] sm:h-[460px]";

function HeroMockupLoop() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % 2), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-700",
          slide === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        )}
      >
        <ReadinessRing percent={82} label="Readiness" size={140} />
        <p className="mt-4 text-center text-xs text-ink-400">
          HRV 68 ms · Sono 7h 42m · Carga moderada
        </p>
      </div>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center p-3 transition-opacity duration-700",
          slide === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
        )}
      >
        <StravaBrandedCard
          athleteName="Inês Silva"
          activityName="Morning Run"
          sportType="Run"
          distanceKm={8.4}
          durationSec={2847}
          avgHr={152}
          elevationM={124}
          readinessScore={82}
          coachName="Tomás Reyes"
          date={new Date()}
          className="w-full max-w-[260px] scale-90 sm:scale-100"
        />
      </div>
    </div>
  );
}

function DeviceContent({ device, heroLoop }: { device: DeviceId; heroLoop?: boolean }) {
  if (device === "iphone") {
    return (
      <IphoneFrame
        className="mx-auto w-full max-w-[min(100%,300px)] sm:max-w-[320px]"
        screenClassName={cn("flex flex-col overflow-hidden", SCREEN_H)}
      >
        {heroLoop ? <HeroMockupLoop /> : <MobileAppPreview />}
      </IphoneFrame>
    );
  }

  if (device === "watch") {
    return (
      <GalaxyWatchFrame variant="apple-ultra" className="mx-auto">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-full w-full origin-center scale-[0.68]">
            {heroLoop ? (
              <div className="flex h-full items-center justify-center p-2">
                <ReadinessRing percent={82} label="Ready" size={80} />
              </div>
            ) : (
              <MobileAppPreview />
            )}
          </div>
        </div>
      </GalaxyWatchFrame>
    );
  }

  return (
    <div className="fc-device-scaler--laptop mx-auto w-full">
      <LaptopFrame>
        <div className="overflow-hidden p-2 sm:p-3">
          <div className="mx-auto w-full max-w-[260px] sm:max-w-[280px]">
            {heroLoop ? <HeroMockupLoop /> : <MobileAppPreview />}
          </div>
        </div>
      </LaptopFrame>
    </div>
  );
}

export function DeviceShowcase({
  className,
  heroLoop = true
}: {
  className?: string;
  heroLoop?: boolean;
}) {
  const [device, setDevice] = useState<DeviceId>("iphone");

  return (
    <div id="product-demo" className={cn("relative w-full min-w-0", className)}>
      <div
        className="relative z-30 mb-4 flex flex-wrap items-center justify-center gap-2 px-1 sm:mb-5"
        role="tablist"
        aria-label="Device preview"
      >
        {DEVICES.map((d) => {
          const Icon = d.icon;
          const isActive = device === d.id;
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setDevice(d.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold backdrop-blur-md transition-colors sm:px-3.5 sm:text-xs",
                isActive
                  ? "border-volt-500/45 bg-volt-500/15 text-volt-300 shadow-volt-glow"
                  : "border-glass-border/80 bg-ink-950/60 text-ink-400 hover:border-volt-500/25 hover:text-ink-100"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{d.label}</span>
            </button>
          );
        })}
      </div>

      <div className="fc-device-stage mx-auto w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 fc-device-stage-spotlight rounded-[2rem]"
        />

        <div
          role="tabpanel"
          aria-label={DEVICES.find((d) => d.id === device)?.label}
          className="fc-device-layer fc-device-layer--active"
        >
          <DeviceContent device={device} heroLoop={heroLoop} />
        </div>

        <div aria-hidden className="fc-device-reflection-slot">
          <div className="fc-device-reflection h-full w-full rounded-[100%] bg-gradient-to-r from-transparent via-volt-500/20 to-transparent blur-xl" />
        </div>
      </div>
    </div>
  );
}
