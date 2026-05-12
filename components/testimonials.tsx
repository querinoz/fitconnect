"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="absolute inset-0 -z-10 gradient-bg-warm opacity-50" />
      <div className="max-w-2xl">
        <p className="eyebrow text-signal-400">Athlete stories</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          Real coaches. Real measurable{" "}
          <span className="gradient-text-warm">progress</span>.
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          Each of these athletes opted in to share their data. The metric on every card is the
          actual change they tracked during their FitConnect program.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            className="relative rounded-2xl border border-ink-800 bg-ink-900/40 p-7 hover:border-signal-400/40 transition-all hover:-translate-y-0.5"
          >
            <Quote className="absolute top-5 right-5 h-7 w-7 text-signal-500/20" />
            <div className="flex items-center gap-1 text-amber-400 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="text-ink-200 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-ink-800">
              <img
                src={t.avatar}
                alt={t.name}
                className="h-11 w-11 rounded-full ring-2 ring-ink-950"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-100 text-sm">{t.name}</p>
                <p className="text-xs text-ink-500 truncate">
                  {t.role} · {t.location}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-lg gradient-text-warm tabular-nums">
                  {t.metric.value}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-ink-500">
                  {t.metric.label}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ink-500">Coach: {t.coachName}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
