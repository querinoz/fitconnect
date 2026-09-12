"use client";

import { useEffect, type ReactNode } from "react";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";

interface LenisProviderProps {
  children: ReactNode;
}

function afterHeroPaint(load: () => void): () => void {
  let started = false;
  const loadOnce = () => {
    if (started) return;
    started = true;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointerdown", loadOnce);
    load();
  };
  const onScroll = () => {
    if (window.scrollY >= 8) loadOnce();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointerdown", loadOnce, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointerdown", loadOnce);
  };
}

/** Smooth scroll via Lenis synced with GSAP ScrollTrigger; disabled when reduced motion. */
export function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    if (shouldReduceMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const stopWait = afterHeroPaint(() => {
      void Promise.all([import("lenis"), import("@/lib/motion/gsap-register")]).then(
        ([{ default: Lenis }, { registerGsapPlugins, gsap, ScrollTrigger }]) => {
          if (cancelled) return;
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

          cleanup = () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
          };
        }
      );
    });

    return () => {
      cancelled = true;
      stopWait();
      cleanup?.();
    };
  }, []);

  return <>{children}</>;
}
