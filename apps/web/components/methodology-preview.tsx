"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { METHODOLOGY } from "@/lib/data";
import { useLocale } from "@/lib/i18n-provider";

export function MethodologyPreview() {
  const locale = useLocale();
  const t = locale.methodologyPreview;
  const preview = METHODOLOGY.slice(0, 3);

  return (
    <section className="relative mx-auto max-w-7xl fc-section-x px-4 py-24 sm:px-6">
      <div className="absolute inset-x-6 top-0 -z-10 h-72 rounded-3xl bg-radial-fade opacity-50" />
      <div className="grid items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-balance leading-tight md:text-5xl">
            {t.title1}
            <br />
            <span className="gradient-text">{t.titleAccent}</span> {t.title2}
          </h2>
          <p className="mt-5 text-lg text-ink-300">{t.body}</p>
          <Link
            href="/methodology"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-brand-300 hover:text-brand-200"
          >
            {t.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
          {preview.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow rounded-2xl border border-ink-800 bg-ink-900/50 p-6 transition-all hover:-translate-y-0.5 hover:bg-ink-900/70"
            >
              <span className="font-display text-3xl font-bold gradient-text">
                {m.number}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                {m.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{m.subtitle}</p>
              <div className="mt-5 flex items-baseline justify-between rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2.5">
                <span className="text-[10px] uppercase tracking-widest text-ink-500">
                  {m.metric.label}
                </span>
                <span className="font-display font-bold gradient-text">
                  {m.metric.value}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
