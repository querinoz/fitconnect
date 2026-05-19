"use client";

import { PRESS_LOGOS } from "@/lib/data";
import { useLocale } from "@/lib/i18n-provider";

const fonts: Record<string, string> = {
  TechCrunch: "font-display font-bold tracking-tight italic",
  Wired: "font-display font-extrabold tracking-tighter",
  Outside: "font-display font-semibold tracking-widest uppercase",
  "Men's Health": "font-display font-black tracking-tight italic",
  "The Verge": "font-display font-bold uppercase tracking-tight",
  GQ: "font-display font-extrabold tracking-[0.3em]"
};

export function PressStrip() {
  const locale = useLocale();
  const label = locale.pressStrip.label;

  return (
    <section className="border-y border-ink-800/60 bg-ink-950/40">
      <div className="mx-auto max-w-7xl fc-section-x px-4 py-10 sm:px-6">
        <p className="mb-8 text-center text-xs uppercase tracking-[0.3em] text-ink-400">
          {label}
        </p>
        <div className="mask-fade-x overflow-hidden">
          <div className="flex animate-marquee gap-12 whitespace-nowrap">
            {[...PRESS_LOGOS, ...PRESS_LOGOS].map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex items-center gap-4 text-ink-400 transition-colors hover:text-ink-100"
              >
                <span
                  className={`text-2xl md:text-3xl ${fonts[p.name] ?? "font-display"}`}
                >
                  {p.name}
                </span>
                <span className="hidden text-[10px] uppercase tracking-widest text-ink-600 md:inline">
                  {p.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
