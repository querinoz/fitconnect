"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { cn } from "@/lib/utils";

type PullQuoteProps = {
  text: string;
  attribution: string;
  className?: string;
};

/** Word-by-word scrub reveal — ink-muted → on-surface as scroll progresses. */
export function PullQuote({ text, attribution, className }: PullQuoteProps) {
  const ref = useRef<HTMLElement>(null);
  const { gateDone } = useLandingGate();

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
      if (!gateDone || !pluginsReady || !plugins.current) return;
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const root = ref.current;
      if (!root) return;
      const { SplitText } = plugins.current;
      const quote = root.querySelector<HTMLElement>(".pq-text");
      if (!quote) return;

      const split = new SplitText(quote, { type: "words", wordsClass: "gsap-word" });
      gsap.set(split.words, { color: "var(--eos-on-surface-subtle)" });

      gsap.to(split.words, {
        color: "var(--eos-on-surface)",
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
          end: "bottom 45%",
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      gsap.from(root.querySelector(".pq-footer"), {
        opacity: 0,
        y: 16,
        scrollTrigger: {
          trigger: root,
          start: "top 60%",
          toggleActions: "play none none none",
          invalidateOnRefresh: true
        }
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [gateDone, pluginsReady] }
  );

  return (
    <section
      ref={ref}
      className={cn("relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-2 top-8 select-none font-display text-[10rem] leading-none text-eos-voltline/10 sm:text-[12rem]"
      >
        «
      </span>
      <blockquote className="relative z-10">
        <p className="pq-text font-display text-[clamp(1.35rem,3.2vw,2.5rem)] font-semibold leading-snug tracking-[-0.02em] text-eos-on-surface">
          {text}
        </p>
        <footer className="pq-footer mt-8 font-mono text-xs uppercase tracking-[0.25em] text-eos-voltline">
          — {attribution}
        </footer>
      </blockquote>
    </section>
  );
}
