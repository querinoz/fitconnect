"use client";

import Link from "next/link";
import { ArrowRight, Activity, Brain, Radio, Zap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/lib/i18n-provider";

const ICONS = [Brain, Zap, Radio, Activity];

export function ScienceAndTech() {
  const locale = useLocale();
  const t = locale.scienceAndTech;
  const reduce = useReducedMotion();

  return (
    <section
      id="methodology"
      className="relative mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24 scroll-mt-24"
    >
      <div className="absolute inset-x-6 top-0 -z-10 h-72 rounded-3xl bg-radial-fade opacity-40" />
      <div className="max-w-2xl">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-balance md:text-5xl">
          {t.title}{" "}
          <span className="gradient-text">{t.titleAccent}</span>
        </h2>
        <p className="mt-4 text-lg text-ink-400">{t.subtitle}</p>
        <Link
          href="/methodology"
          className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-300 hover:text-brand-200"
        >
          {t.cta} <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.tiles.map((tile, i) => {
          const Icon = ICONS[i] ?? Brain;
          return (
            <motion.article
              key={tile.title}
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : i * 0.08 }}
              className="card-glow group rounded-2xl border border-ink-800 bg-ink-900/50 p-6 transition-all hover:-translate-y-0.5 hover:border-volt-500/25 hover:bg-ink-900/70"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-volt-dim text-volt-500 ring-1 ring-volt-500/25">
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                {tile.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{tile.body}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
