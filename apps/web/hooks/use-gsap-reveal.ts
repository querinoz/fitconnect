"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";

type RevealOptions = {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
  delay?: number;
};

/** Scroll-triggered reveal — GSAP + ScrollTrigger; no-op when reduced motion. */
export function useGsapReveal(
  scopeRef: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    y = 48,
    stagger = 0.1,
    start = "top 82%",
    delay = 0
  } = options;

  useGSAP(
    () => {
      registerGsapPlugins();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = scopeRef.current;
      if (!root || reduced) return;

      const targets = root.querySelectorAll(selector);
      if (!targets.length) return;

      gsap.from(targets, {
        y,
        opacity: 0,
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
    { scope: scopeRef, dependencies: [selector, y, stagger, start, delay] }
  );
}
