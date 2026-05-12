"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Tell us about your goals",
    body: "30-second profile. We'll match you with up to 5 specialists in your sport."
  },
  {
    n: "02",
    title: "Book a free intro call",
    body: "Try them on a 15-minute discovery call. Switch any time — zero questions asked."
  },
  {
    n: "03",
    title: "Train and track progress",
    body: "Receive weekly plans, log workouts, and watch your dashboard light up with PRs."
  }
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
          How it works
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
          From signing up to your first PR in less than a week.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="rounded-2xl border border-ink-800 bg-ink-900/40 p-7"
          >
            <span className="font-display text-5xl gradient-text font-bold">
              {s.n}
            </span>
            <h3 className="mt-4 font-display font-semibold text-xl">{s.title}</h3>
            <p className="mt-2 text-ink-400">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
