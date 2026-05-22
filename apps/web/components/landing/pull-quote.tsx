"use client";

import { useRef } from "react";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { cn } from "@/lib/utils";

type PullQuoteProps = {
  text: string;
  attribution: string;
  className?: string;
};

export function PullQuote({ text, attribution, className }: PullQuoteProps) {
  const ref = useRef<HTMLElement>(null);
  useGsapReveal(ref, { selector: "[data-reveal]", y: 32 });

  return (
    <section
      ref={ref}
      className={cn("relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-2 top-8 select-none font-display text-[10rem] leading-none text-volt-500/10 sm:text-[12rem]"
      >
        «
      </span>
      <blockquote data-reveal className="relative z-10">
        <p className="font-display text-[clamp(1.35rem,3.2vw,2.5rem)] font-semibold leading-snug tracking-[-0.02em] text-ink-50">
          {text}
        </p>
        <footer className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-volt-500">
          — {attribution}
        </footer>
      </blockquote>
    </section>
  );
}
