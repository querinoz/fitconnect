"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Laptop, Smartphone, Watch } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IphoneFrame } from "./iphone-frame";
import { GalaxyWatchFrame } from "./galaxy-watch-frame";
import { LaptopFrame } from "./laptop-frame";
import { MobileAppPreview } from "@/components/dashboard/mobile-app-preview";
import { MOTION } from "@/lib/use-entrance-motion";
import { useAppearance } from "@/lib/theme/use-appearance";

type DeviceId = "iphone" | "watch" | "laptop";

const DEVICES: {
  id: DeviceId;
  label: string;
  icon: typeof Smartphone;
  floatClass: string;
}[] = [
  { id: "iphone", label: "iPhone 17", icon: Smartphone, floatClass: "fc-device-float-phone" },
  {
    id: "watch",
    label: "Galaxy Watch Ultra",
    icon: Watch,
    floatClass: "fc-device-float-watch"
  },
  { id: "laptop", label: "Laptop", icon: Laptop, floatClass: "fc-device-float-laptop" }
];

export function DeviceShowcase({ className }: { className?: string }) {
  const { reduceMotion } = useAppearance();
  const [device, setDevice] = useState<DeviceId>("iphone");

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setDevice((current) => {
        const idx = DEVICES.findIndex((d) => d.id === current);
        return DEVICES[(idx + 1) % DEVICES.length]!.id;
      });
    }, 5200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const activeDevice = DEVICES.find((d) => d.id === device)!;

  return (
    <div id="product-demo" className={cn("relative w-full", className)}>
      {/* Device selector — sits above the stage, never over the bezel */}
      <div className="relative z-30 mb-8 flex flex-wrap items-center justify-center gap-2 px-2">
        {DEVICES.map((d) => {
          const Icon = d.icon;
          const active = device === d.id;
          return (
            <button
              key={d.id}
              type="button"
              aria-pressed={active}
              onClick={() => setDevice(d.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all",
                active
                  ? "border-volt-500/45 bg-volt-500/15 text-volt-300 shadow-volt-glow"
                  : "border-glass-border/80 bg-ink-950/60 text-ink-400 hover:border-volt-500/25 hover:text-ink-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Stage — spotlight + device with room for floating cards beside it */}
      <div className="relative mx-auto flex min-h-[560px] max-w-[420px] items-center justify-center px-6 sm:max-w-none sm:px-10 lg:min-h-[600px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 fc-device-stage-spotlight rounded-[3rem]"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={device}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -14, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: reduceMotion ? 0 : MOTION.screen, ease: MOTION.ease }}
            className={cn(
              "relative z-10 w-full",
              device === "iphone" && "fc-device-tilt max-w-[320px] sm:max-w-[340px] mx-auto",
              device === "laptop" && "fc-device-tilt max-w-[720px] mx-auto"
            )}
          >
            <div className={cn("relative", activeDevice.floatClass)}>
              {device === "iphone" && (
                <IphoneFrame screenClassName="min-h-[580px] max-h-[640px]">
                  <MobileAppPreview />
                </IphoneFrame>
              )}
              {device === "watch" && (
                <GalaxyWatchFrame>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="h-full w-full scale-[0.68] origin-center">
                      <MobileAppPreview />
                    </div>
                  </div>
                </GalaxyWatchFrame>
              )}
              {device === "laptop" && (
                <LaptopFrame>
                  <div className="grid min-h-[380px] gap-0 lg:grid-cols-[320px_1fr]">
                    <div className="border-r border-ink-800/80 p-3">
                      <MobileAppPreview />
                    </div>
                    <div className="premium-grid hidden p-4 opacity-30 lg:block">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-volt-400">
                        Coach OS
                      </p>
                      <p className="mt-2 font-display text-xl font-bold text-ink-50">
                        Live roster intelligence
                      </p>
                      <div className="mt-4 flex h-32 items-end gap-2">
                        {[62, 78, 55, 82, 71, 88, 64].map((h, i) => (
                          <span
                            key={i}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500/70 to-volt-400 transition-all duration-700"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </LaptopFrame>
              )}
            </div>

            {/* Floor reflection */}
            <div
              aria-hidden
              className={cn(
                "fc-device-reflection pointer-events-none absolute left-1/2 h-6 rounded-[100%] bg-gradient-to-r from-transparent via-volt-500/25 to-transparent blur-xl",
                device === "iphone" && "-bottom-6 w-[72%]",
                device === "watch" && "-bottom-4 w-[55%]",
                device === "laptop" && "-bottom-5 w-[80%]"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
