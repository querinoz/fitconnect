"use client";

import { type ReactNode, useState, useCallback } from "react";
import { CrosshairBg } from "@/components/elite-os";
import { HeroGate } from "@/components/landing/hero-gate";
import { LandingGateContext } from "@/components/landing/landing-gate-context";
import { ScrollTrigger } from "@/lib/motion/gsap-register";

type LandingShellV2Props = {
  children: ReactNode;
  /**
   * When true, renders the boot-gate overlay and holds GSAP reveals
   * until the gate completes. When false (default), reveals fire immediately.
   */
  withBootGate?: boolean;
};

/** Elite OS landing shell — EOS floor + crosshair, optional boot gate. */
export function LandingShellV2({ children, withBootGate = false }: LandingShellV2Props) {
  // When no boot gate, animations are ready immediately.
  const [gateDone, setGateDone] = useState(!withBootGate);

  const handleGateComplete = useCallback(() => {
    setGateDone(true);
    // Recalculate all scroll-trigger positions now that the gate overlay is gone.
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh(true);
    }
  }, []);

  return (
    <LandingGateContext.Provider value={{ gateDone }}>
      {withBootGate && !gateDone && <HeroGate onComplete={handleGateComplete} />}
      <CrosshairBg className="eos-floor relative min-h-dvh text-eos-on-surface">
        <main id="main" className="relative flex w-full flex-col">
          {children}
        </main>
      </CrosshairBg>
    </LandingGateContext.Provider>
  );
}
