"use client";

import Image from "next/image";
import { useRef } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";

const BRANDS = [
  { src: "/brands/strava.svg", alt: "Strava" },
  { src: "/brands/garmin.svg", alt: "Garmin" },
  { src: "/brands/apple-health.svg", alt: "Apple Health" },
  { src: "/brands/whoop.svg", alt: "Whoop" },
  { src: "/brands/oura.svg", alt: "Oura" }
] as const;

export function TrustEditorial() {
  const copy = useLocale().landingEditorial.trust;
  const ref = useRef<HTMLElement>(null);
  useGsapReveal(ref, { selector: "[data-reveal]", stagger: 0.08, y: 24 });

  const stats = [
    { value: copy.rating, label: copy.ratingLabel },
    { value: copy.reviews, label: copy.reviewsLabel },
    { value: copy.rejected, label: copy.rejectedLabel },
    { value: copy.retention, label: copy.retentionLabel }
  ];

  return (
    <section
      ref={ref}
      className="border-y border-white/5 bg-ink-950 px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} data-reveal className="text-center md:text-left">
              <p className="font-display text-3xl font-extrabold text-volt-500 sm:text-4xl md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-white/5 pt-10 md:justify-between"
        >
          {BRANDS.map((brand) => (
            <Image
              key={brand.alt}
              src={brand.src}
              alt={brand.alt}
              width={96}
              height={28}
              className="h-6 w-auto opacity-50 brightness-0 invert"
            />
          ))}
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt-500/80">
            {copy.verified}
          </span>
        </div>
      </div>
    </section>
  );
}
