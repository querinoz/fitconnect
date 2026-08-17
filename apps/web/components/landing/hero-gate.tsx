"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useLocale } from "@/lib/i18n-provider";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { cn } from "@/lib/utils";

export const LANDING_BOOT_KEY = "fitconnect:landing-boot";

type HeroGateProps = {
  onComplete: () => void;
};

/** Short Elite OS boot — skipped on return visits and reduced motion. */
export function HeroGate({ onComplete }: HeroGateProps) {
  const copy = useLocale().landingEditorial.gate;
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LANDING_BOOT_KEY) === "1") {
        onComplete();
        return;
      }
    } catch {
      /* private mode */
    }

    if (shouldReduceMotion()) {
      try {
        sessionStorage.setItem(LANDING_BOOT_KEY, "1");
      } catch {
        /* ignore */
      }
      onComplete();
      return;
    }

    setVisible(true);
    const start = performance.now();
    const duration = 1400;
    let frame = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      setProgress(pct);
      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);

    const hideTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(LANDING_BOOT_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(false);
      onComplete();
    }, 1700);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-boot-title"
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-eos-floor transition-opacity duration-500",
        progress >= 100 ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <p id="landing-boot-title" className="font-display text-2xl font-extrabold tracking-tight text-eos-on-surface">
        {copy.brand}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.4em] text-eos-voltline">{copy.osLabel}</p>
      <BrandLogo size={56} priority className="mt-8 font-display font-extrabold text-eos-on-surface" />
      <div className="mt-10 h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-eos-voltline transition-[width] duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-eos-on-surface-muted">
        {progress >= 100 ? copy.systemReady : copy.initializing}
      </p>
    </div>
  );
}
