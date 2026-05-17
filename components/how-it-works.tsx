"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Search, Sparkles, TrendingUp } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";

const stepIcons = [Search, Sparkles, TrendingUp];

export function HowItWorks() {
  const locale = useLocale();

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto"
      >
        <p className="eyebrow">{locale.how.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          {locale.how.title}{" "}
          <span className="gradient-text">{locale.how.titleAccent}</span>.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">{locale.how.subtitle}</p>
      </motion.div>

      <motion.div className="mt-14 grid gap-6 md:grid-cols-3 relative">
        <div
          aria-hidden
          className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent"
        />
        {locale.how.steps.map((s, i) => {
          const Icon = stepIcons[i];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-ink-800 bg-ink-900/40 p-7 hover:bg-ink-900/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl gradient-text font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 ring-1 ring-ink-800 text-brand-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="mt-5 font-display font-semibold text-xl">{s.title}</h3>
              <p className="mt-2 text-ink-400">{s.body}</p>
              <p className="mt-5 inline-flex items-center gap-2 text-xs text-accent-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {s.detail}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
