"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { registerGsapPlugins, gsap, ScrollTrigger } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";

interface LenisProviderProps {
  children: ReactNode;
}

/** Smooth scroll via Lenis synced with GSAP ScrollTrigger; disabled when reduced motion. */
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    if (shouldReduceMotion()) return;

    registerGsapPlugins();

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
