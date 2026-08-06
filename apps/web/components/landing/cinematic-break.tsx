"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { cn } from "@/lib/utils";

type CinematicBreakProps = {
  /** First line — rendered left-aligned in on-surface color. */
  lineOne: string;
  /** Second line — rendered right-aligned in voltline color. */
  lineTwo: string;
  className?: string;
};

/**
 * Editorial typographic separator — giant split headline with:
 * - DrawSVG animated horizontal rule (draws left-to-right on scroll)
 * - SplitText per-word stagger on both lines
 */
export function CinematicBreak({ lineOne, lineTwo, className }: CinematicBreakProps) {
  const ref = useRef<HTMLElement>(null);
  const { gateDone } = useLandingGate();

  const plugins = useRef<GsapPremiumPlugins | null>(null);
  const [pluginsReady, setPluginsReady] = useState(false);

  useEffect(() => {
    if (plugins.current) return;
    registerGsapPremium()
      .then((p) => { plugins.current = p; setPluginsReady(true); })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      if (!gateDone || !pluginsReady || !plugins.current) return;
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const root = ref.current;
      if (!root) return;
      const { SplitText, DrawSVGPlugin } = plugins.current;
      // DrawSVGPlugin requires re-registration per scope
      gsap.registerPlugin(DrawSVGPlugin);

      // Horizontal rule: draw from 0% to 100% on scroll entry
      const rule = root.querySelector<SVGPathElement>(".cb-rule");
      if (rule) {
        gsap.from(rule, {
          drawSVG: "0%",
          duration: 1.1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            toggleActions: "play none none none",
            invalidateOnRefresh: true
          }
        });
      }

      // Per-word stagger for both text lines
      const lines = Array.from(root.querySelectorAll<HTMLElement>(".cb-line"));
      const splits = lines.map((el, i) => {
        const split = new SplitText(el, { type: "words", wordsClass: "gsap-word" });
        gsap.from(split.words, {
          y: 36,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            toggleActions: "play none none none",
            invalidateOnRefresh: true
          },
          onComplete: () => split.revert()
        });
        return split;
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: ref, dependencies: [gateDone, pluginsReady] }
  );

  return (
    <section
      ref={ref}
      aria-hidden
      className={cn(
        "relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 md:py-32",
        className
      )}
    >
      {/* DrawSVG horizontal rule */}
      <svg
        aria-hidden
        className="absolute left-0 top-1/2 w-full -translate-y-1/2"
        height="1"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1"
      >
        <path
          className="cb-rule"
          d="M0 0.5 H1440"
          stroke="rgba(200,255,0,0.18)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <p className="cb-line font-display text-[clamp(2.5rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-eos-on-surface">
        {lineOne}
      </p>
      <p className="cb-line mt-2 text-right font-display text-[clamp(2.5rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-eos-voltline">
        {lineTwo}
      </p>
    </section>
  );
}
