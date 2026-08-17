"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";

type RevealOptions = {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
  delay?: number;
};

/** Scroll-triggered reveal — GSAP + ScrollTrigger; waits for landing gate when present. */
export function useGsapReveal(
  scopeRef: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const { gateDone } = useLandingGate();
  const {
    selector = "[data-reveal]",
    y = 48,
    stagger = 0.1,
    start = "top 82%",
    delay = 0
  } = options;

  useGSAP(
    () => {
      if (!gateDone) return;
      registerGsapPlugins();
      const reduced = shouldReduceMotion();
      const root = scopeRef.current;
      if (!root || reduced) return;

      const targets = root.querySelectorAll(selector);
      if (!targets.length) return;

      // Transform only — never park copy at opacity 0 if ScrollTrigger misses.
      gsap.from(targets, {
        y,
        duration: 0.85,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root,
          start,
          toggleActions: "play none none none"
        }
      });
    },
    { scope: scopeRef, dependencies: [gateDone, selector, y, stagger, start, delay] }
  );
}
