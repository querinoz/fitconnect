"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";
import { DemoReadiness } from "./demo-readiness";
import { DemoCoachFlip } from "./demo-coach-flip";
import { DemoMatch } from "./demo-match";

const demoComponents = [
  <DemoReadiness key="readiness" />,
  <DemoCoachFlip key="coach" />,
  <DemoMatch key="match" />
];

export function DemosSection() {
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <section
      id="see-it-in-action"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> {locale.demos.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
          {locale.demos.title}{" "}
          <span className="gradient-text">{locale.demos.titleAccent}</span> looks like.
        </h2>
        <p className="mt-4 text-ink-300 text-lg">{locale.demos.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {locale.demos.tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: reduce ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: reduce ? 0 : 0.55,
              delay: reduce ? 0 : i * 0.08,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <p className="text-[10px] uppercase tracking-widest text-brand-300 font-bold mb-2 px-1">
              0{i + 1} · {t.label}
            </p>
            {demoComponents[i]}
            <p className="mt-3 px-1 text-sm text-ink-400 leading-relaxed">{t.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink-800 bg-ink-900/40 px-6 py-5">
        <div>
          <p className="font-display font-bold text-ink-50">{locale.demos.ctaTitle}</p>
          <p className="text-sm text-ink-400">{locale.demos.ctaBody}</p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-semibold px-5 h-11 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          {locale.demos.ctaButton}{" "}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
