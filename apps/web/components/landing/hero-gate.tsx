"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useLocale } from "@/lib/i18n-provider";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { cn } from "@/lib/utils";

type HeroGateProps = {
  onComplete: () => void;
};

/** Lando-style boot screen — volt progress bar then dissolve. */
export function HeroGate({ onComplete }: HeroGateProps) {
  const copy = useLocale().landingEditorial.gate;
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion()) {
      onComplete();
      setVisible(false);
      return;
    }

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
      setVisible(false);
      onComplete();
    }, 1800);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink-950 transition-opacity duration-500",
        progress >= 100 ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      aria-hidden
    >
      <BrandLogo size={64} priority className="font-display font-extrabold text-ink-50" />
      <div className="mt-10 h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-volt-500 transition-[width] duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.35em] text-ink-400/80">
        {copy.initializing}
      </p>
    </div>
  );
}
