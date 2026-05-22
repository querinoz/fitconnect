"use client";

import Link from "next/link";
import { useRef } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { cn } from "@/lib/utils";

export function FinalCta() {
  const copy = useLocale().landingEditorial.finalCta;
  const ref = useRef<HTMLElement>(null);
  useGsapReveal(ref, { selector: "[data-reveal]", y: 40, stagger: 0.12 });

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6",
        "bg-ink-950"
      )}
      style={{
        backgroundImage: [
          "radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--volt-500) 8%, transparent) 0%, transparent 50%)",
          "radial-gradient(ellipse at 80% 50%, color-mix(in srgb, var(--lime, #39FF14) 5%, transparent) 0%, transparent 50%)"
        ].join(", ")
      }}
    >
      <p
        data-reveal
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-volt-500"
      >
        {copy.eyebrow}
      </p>
      <h2
        data-reveal
        className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-ink-50"
      >
        {copy.headline}
      </h2>
      <p data-reveal className="mt-4 font-display text-lg text-volt-500 sm:text-xl">
        {copy.subheadline}
      </p>
      <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/discover"
          className="inline-flex items-center justify-center rounded-full bg-volt-500 px-8 py-3.5 text-sm font-semibold text-ink-950 transition hover:bg-volt-400"
        >
          {copy.primary}
        </Link>
        <Link
          href="/dashboard?demo=athlete"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-ink-50 backdrop-blur transition hover:border-volt-500/40"
        >
          {copy.secondary}
        </Link>
      </div>
      <p data-reveal className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
        {copy.footer}
      </p>
    </section>
  );
}
