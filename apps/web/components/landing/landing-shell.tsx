"use client";

import { useCallback, useState, type ReactNode } from "react";
import { LandingCanvas } from "@/components/marketing/landing-canvas";
import { HeroGate } from "@/components/landing/hero-gate";
import { NavbarPill } from "@/components/nav/navbar-pill";
import { LandingGateContext } from "@/components/landing/landing-gate-context";

type LandingShellProps = {
  children: ReactNode;
};

/** Client wrapper: boot gate, pill nav, smooth editorial canvas. */
export function LandingShell({ children }: LandingShellProps) {
  const [gateDone, setGateDone] = useState(false);
  const onGateComplete = useCallback(() => setGateDone(true), []);

  return (
    <LandingGateContext.Provider value={{ gateDone }}>
      <HeroGate onComplete={onGateComplete} />
      <NavbarPill enabled={gateDone} />
      <LandingCanvas subdued />
      <main id="main" className="fc-page-root landing-editorial relative flex w-full flex-col">
        {children}
      </main>
    </LandingGateContext.Provider>
  );
}
