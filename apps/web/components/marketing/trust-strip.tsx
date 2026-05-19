"use client";

import { useLocale } from "@/lib/i18n-provider";

const LOGOS = [
  { name: "Strava", src: "/brands/strava.svg" },
  { name: "Garmin", src: "/brands/garmin.svg" },
  { name: "Apple Health", src: "/brands/apple-health.svg" },
  { name: "Whoop", src: "/brands/whoop.svg" },
  { name: "Oura", src: "/brands/oura.svg" }
];

export function TrustStrip() {
  const locale = useLocale();
  const t = locale.trustStrip;

  return (
    <section
      aria-label="Trust indicators"
      className="border-y border-ink-800/60 bg-ink-950/50 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 fc-section-x px-4 py-6 sm:flex-row sm:justify-between sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center sm:justify-start sm:text-left">
          <span className="font-display text-lg font-bold text-amber-400 tabular-nums">
            {t.reviews}
          </span>
          <span aria-hidden="true" className="hidden text-ink-700 sm:inline">
            ·
          </span>
          <span className="rounded-full bg-volt-dim px-3 py-1 text-xs font-semibold text-volt-400 ring-1 ring-volt-500/25">
            {t.rejected}
          </span>
          <span aria-hidden="true" className="hidden text-ink-700 sm:inline">
            ·
          </span>
          <span className="text-sm text-ink-400">{t.coaches}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          {LOGOS.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              width={88}
              height={22}
              className="h-5 w-auto opacity-50 grayscale transition-all hover:opacity-90 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
