"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Search, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Tell us about your goals",
    body:
      "60-second profile. Sport, level, schedule, preferred modality. We surface your top 3 matches across 12,418 verified specialists.",
    detail: "Avg. match time: 47 seconds"
  },
  {
    n: "02",
    icon: Sparkles,
    title: "Book a free 15-min intro",
    body:
      "Meet your top coach on a live call before paying a cent. Switch any time — your athlete profile travels with you. No re-onboarding ever.",
    detail: "94% book the same coach again"
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "Train, track, evolve",
    body:
      "Weekly plans. Live video sessions. Workout logs. HRV-aware recovery. Watch your dashboard light up with PRs — and your coach adjust in real time.",
    detail: "73% hit their 90-day goal"
  }
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          From sign-up to your first PR{" "}
          <span className="gradient-text">in less than a week</span>.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">
          Three steps. Zero friction. No credit card to talk to a real coach.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3 relative">
        <div
          aria-hidden
          className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent"
        />
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative rounded-2xl border border-ink-800 bg-ink-900/40 p-7 hover:bg-ink-900/60 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="font-display text-5xl gradient-text font-bold">
                {s.n}
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 ring-1 ring-ink-800 text-brand-300">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="mt-5 font-display font-semibold text-xl">{s.title}</h3>
            <p className="mt-2 text-ink-400">{s.body}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-accent-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {s.detail}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
