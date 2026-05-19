"use client";

import { useLocale } from "@/lib/i18n-provider";

const BADGES = ["Athletes", "Coaches", "Ship"] as const;

export function TextMarquee() {
  const locale = useLocale();
  const lines = [
    locale.hero.subtitle,
    locale.hero.reassurance,
    `${locale.hero.rejectedTitle} — ${locale.hero.rejectedBody}`,
    locale.hero.livePill
  ];

  const track = [...lines, ...lines, ...lines];

  return (
    <section aria-hidden className="fc-marquee-viewport relative py-8 sm:py-10 overflow-hidden border-y border-ink-800/50">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />

      <div className="mb-6 flex justify-center gap-2 px-6">
        {BADGES.map((b) => (
          <span
            key={b}
            className="rounded-full border border-ink-700/80 bg-ink-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400"
          >
            {b}
          </span>
        ))}
      </div>

      <div className="fc-text-marquee fc-marquee-track flex whitespace-nowrap">
        {track.map((line, i) => (
          <span
            key={`${i}-${line.slice(0, 24)}`}
            className="inline-flex items-center px-8 font-display text-xl md:text-2xl font-semibold text-ink-500/80"
          >
            {line}
            <span className="mx-8 text-volt-500/40">·</span>
          </span>
        ))}
      </div>
    </section>
  );
}
