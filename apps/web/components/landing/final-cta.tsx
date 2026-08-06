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
        "bg-eos-floor"
      )}
      style={{
        backgroundImage: [
          "radial-gradient(ellipse at 20% 50%, color-mix(in srgb, var(--eos-voltline) 12%, transparent) 0%, transparent 50%)",
          "radial-gradient(ellipse at 80% 50%, color-mix(in srgb, var(--eos-connect) 8%, transparent) 0%, transparent 50%)"
        ].join(", ")
      }}
    >
      <p
        data-reveal
        className="font-mono text-[10px] uppercase tracking-[0.35em] text-eos-voltline"
      >
        {copy.eyebrow}
      </p>
      <h2
        data-reveal
        className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,8vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-eos-on-surface"
      >
        {copy.headline}
      </h2>
      <p data-reveal className="mt-4 font-display text-lg text-eos-voltline sm:text-xl">
        {copy.subheadline}
      </p>
      <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/discover"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-eos-voltline px-8 py-3.5 text-sm font-semibold text-eos-floor transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eos-voltline active:translate-y-px"
        >
          {copy.primary}
        </Link>
        <Link
          href="/dashboard?demo=athlete"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-eos-on-surface backdrop-blur transition hover:border-eos-voltline/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        >
          {copy.secondary}
        </Link>
      </div>
      <p
        data-reveal
        className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-eos-on-surface-muted"
      >
        {copy.footer}
      </p>
    </section>
  );
}
