"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useSplitTextReveal } from "@/hooks/use-split-text-reveal";
import { useLandingGate } from "@/components/landing/landing-gate-context";

const BRAND_ICONS = [
  { src: "/brands/strava.svg", alt: "Strava" },
  { src: "/brands/garmin.svg", alt: "Garmin" },
  { src: "/brands/apple-health.svg", alt: "Apple Health" },
  { src: "/brands/whoop.svg", alt: "Whoop" }
] as const;

export function FeatureManifesto() {
  const m = useLocale().landingEditorial.manifesto;
  const ref = useRef<HTMLElement>(null);
  const { gateDone } = useLandingGate();

  // Block-level fade+rise on scroll
  useGsapReveal(ref, { selector: "[data-block]", y: 56, stagger: 0.15 });

  // Per-word stagger on headlines — runs after block reveal
  useSplitTextReveal(ref, {
    selector: "[data-split]",
    stagger: 0.04,
    start: "top 80%",
    ready: gateDone
  });

  const blocks = [
    { ...m.block1, hasMetric: true as const },
    { ...m.block2, hasMetric: true as const },
    { ...m.block3, hasMetric: false as const }
  ];

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="space-y-20 md:space-y-28">
        {blocks.map((block) => (
          <article
            key={block.label}
            data-block
            className="grid gap-8 border-t border-white/5 pt-12 md:grid-cols-2 md:gap-16 md:pt-16"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt-500">
                {block.label}
              </p>
              <h3
                data-split
                className="mt-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight tracking-[-0.03em] text-ink-50"
              >
                {block.title}
              </h3>
            </div>
            <div className="flex flex-col justify-between gap-8">
              <p className="max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">{block.body}</p>
              {block.hasMetric ? (
                <div>
                  <p className="font-display text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-none text-volt-500">
                    {block.metric}
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-ink-400">{block.metricLabel}</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-6">
                  {BRAND_ICONS.map((icon) => (
                    <Image
                      key={icon.alt}
                      src={icon.src}
                      alt={icon.alt}
                      width={80}
                      height={24}
                      className="h-5 w-auto opacity-60 brightness-0 invert"
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
