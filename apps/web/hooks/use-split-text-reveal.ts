"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";

type SplitRevealOptions = {
  /** CSS selector for elements to split (default: "[data-split]") */
  selector?: string;
  /** Per-word stagger seconds (default: 0.05) */
  stagger?: number;
  /** ScrollTrigger start (default: "top 85%") */
  start?: string;
  /** Gate animation until this is true */
  ready?: boolean;
};

/**
 * Scroll-triggered SplitText word reveal.
 * Elements matching `selector` inside `scopeRef` have their words staggered
 * with a short rise on scroll entry. Copy stays visible if motion is skipped.
 * Respects prefers-reduced-motion.
 */
export function useSplitTextReveal(
  scopeRef: React.RefObject<HTMLElement | null>,
  options: SplitRevealOptions = {}
) {
  const {
    selector = "[data-split]",
    stagger = 0.05,
    start = "top 85%",
    ready = true
  } = options;

  const plugins = useRef<GsapPremiumPlugins | null>(null);
  const [pluginsReady, setPluginsReady] = useState(false);

  useEffect(() => {
    if (plugins.current) return;
    registerGsapPremium()
      .then((p) => {
        plugins.current = p;
        setPluginsReady(true);
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      if (!ready || !pluginsReady || !plugins.current) return;
      if (shouldReduceMotion()) return;
      const root = scopeRef.current;
      if (!root) return;

      registerGsapPlugins();
      const { SplitText } = plugins.current;
      const headlines = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (!headlines.length) return;

      const splits = headlines.map((el) => {
        const split = new SplitText(el, { type: "words", wordsClass: "gsap-word" });
        gsap.from(split.words, {
          y: 24,
          duration: 0.75,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
            invalidateOnRefresh: true
          }
        });
        return split;
      });

      return () => {
        splits.forEach((s) => s.revert());
      };
    },
    { scope: scopeRef, dependencies: [ready, pluginsReady, selector, stagger, start] }
  );
}
