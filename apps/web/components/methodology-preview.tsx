"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { METHODOLOGY } from "@/lib/data";

export function MethodologyPreview() {
  const preview = METHODOLOGY.slice(0, 3);
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="absolute inset-x-6 top-0 -z-10 h-72 rounded-3xl bg-radial-fade opacity-50" />
      <div className="grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-5">
          <p className="eyebrow">The Specialist Standard™</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
            We didn&apos;t build a marketplace.<br />
            We built a{" "}
            <span className="gradient-text">verification system</span> that happens to be one.
          </h2>
          <p className="mt-5 text-ink-300 text-lg">
            Six principles separate a real specialist from someone with a homepage. We hold our
            coaches to all of them — and publish the data when we don&apos;t.
          </p>
          <Link
            href="/methodology"
            className="mt-7 inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 font-semibold"
          >
            Read the full methodology <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="lg:col-span-7 grid gap-4 sm:grid-cols-3">
          {preview.map((m, i) => (
            <motion.article
              key={m.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-glow rounded-2xl border border-ink-800 bg-ink-900/50 p-6 hover:bg-ink-900/70 transition-all hover:-translate-y-0.5"
            >
              <span className="font-display text-3xl font-bold gradient-text">
                {m.number}
              </span>
              <h3 className="mt-3 font-display font-semibold text-lg leading-snug">
                {m.title}
              </h3>
              <p className="mt-2 text-sm text-ink-400 leading-relaxed">
                {m.subtitle}
              </p>
              <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2.5 flex items-baseline justify-between">
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
