"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  HeartHandshake,
  Shield,
  Sparkles,
  Wallet
} from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";

const pointIcons = [
  BadgeCheck,
  Clock,
  Sparkles,
  Shield,
  HeartHandshake,
  Wallet
] as const;

const pointTones = [
  "accent",
  "brand",
  "plasma",
  "brand",
  "signal",
  "accent"
] as const;

const toneStyles: Record<
  (typeof pointTones)[number],
  { ring: string; icon: string; metric: string; halo: string }
> = {
  brand: {
    ring: "ring-brand-500/30",
    icon: "text-brand-300 bg-brand-500/10",
    metric: "text-brand-300",
    halo: "from-brand-500/20 to-transparent"
  },
  accent: {
    ring: "ring-accent-500/30",
    icon: "text-accent-400 bg-accent-500/10",
    metric: "text-accent-400",
    halo: "from-accent-500/20 to-transparent"
  },
  plasma: {
    ring: "ring-plasma-500/30",
    icon: "text-plasma-300 bg-plasma-500/10",
    metric: "text-plasma-300",
    halo: "from-plasma-500/20 to-transparent"
  },
  signal: {
    ring: "ring-signal-500/30",
    icon: "text-signal-400 bg-signal-500/10",
    metric: "text-signal-400",
    halo: "from-signal-500/20 to-transparent"
  }
};

export function WhyFitConnect() {
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="fc-why-title"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="absolute inset-x-12 top-12 -z-10 h-[420px] rounded-[3rem] bg-radial-fade opacity-60" />

      <div className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> {locale.why.eyebrow}
        </p>
        <h2
          id="fc-why-title"
          className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight"
        >
          {locale.why.title}{" "}
          <span className="gradient-text">{locale.why.titleAccent}</span>.
        </h2>
        <p className="mt-4 text-ink-300 text-lg">{locale.why.subtitle}</p>
      </div>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {locale.why.points.map((p, i) => {
          const toneKey = pointTones[i];
          const tone = toneStyles[toneKey];
          const Icon = pointIcons[i];
          return (
            <motion.li
              key={p.title}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reduce ? 0 : 0.5,
                delay: reduce ? 0 : (i % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="group relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/50 p-6 transition-all hover:-translate-y-0.5 hover:border-ink-700 hover:bg-ink-900/75"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-radial ${tone.halo} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                style={{
                  background: `radial-gradient(circle, ${
                    toneKey === "brand"
                      ? "rgba(34,211,238,0.18)"
                      : toneKey === "accent"
                        ? "rgba(132,204,22,0.16)"
                        : toneKey === "plasma"
                          ? "rgba(168,85,247,0.18)"
                          : "rgba(244,63,94,0.16)"
                  } 0%, transparent 65%)`
                }}
              />

              <div className="flex items-start justify-between gap-4">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${tone.ring} ${tone.icon}`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <p
                    className={`font-display text-2xl font-bold tabular-nums leading-none ${tone.metric}`}
                  >
                    {p.metric}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-ink-500">
                    {p.metricLabel}
                  </p>
                </div>
              </div>

              <h3 className="mt-5 font-display font-semibold text-lg leading-snug text-ink-50">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-ink-400 leading-relaxed">{p.body}</p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
