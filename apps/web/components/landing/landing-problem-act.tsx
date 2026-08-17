"use client";

import { useLocale } from "@/lib/i18n-provider";

export function LandingProblemAct() {
  const copy = useLocale().landingEditorial.problem;

  return (
    <section
      id="problem"
      className="mx-auto w-[min(calc(100%-2rem),1440px)] scroll-mt-28 border-y border-white/10 py-16 sm:py-20"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-eos-alert">{copy.eyebrow}</p>
      <h2 className="mt-4 max-w-[18ch] font-display text-[clamp(2rem,6vw,4.2rem)] font-extrabold leading-[0.92] tracking-tight text-eos-on-surface">
        {copy.title}
      </h2>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-eos-on-surface-muted">{copy.body}</p>
      <p className="mt-6 font-mono text-sm uppercase tracking-[0.18em] text-eos-voltline">{copy.resolve}</p>
    </section>
  );
}
