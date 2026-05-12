"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { DemoReadiness } from "./demo-readiness";
import { DemoCoachFlip } from "./demo-coach-flip";
import { DemoMatch } from "./demo-match";

const tiles = [
  {
    label: "Daily readiness",
    body: "HRV + sleep land in your dashboard before sunrise. Today says: train hard.",
    component: <DemoReadiness />
  },
  {
    label: "Real specialists, not generalists",
    body: "Tap a coach card. See the certs we validated and the program they signed.",
    component: <DemoCoachFlip />
  },
  {
    label: "Match in 60 seconds",
    body: "Three questions. We hand-pair you with the right specialist for your sport.",
    component: <DemoMatch />
  }
];

export function DemosSection() {
  const reduce = useReducedMotion();
  return (
    <section
      id="see-it-in-action"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> See it in action
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
          Three loops that show what training with{" "}
          <span className="gradient-text">a real specialist</span> looks like.
        </h2>
        <p className="mt-4 text-ink-300 text-lg">
          No videos, no marketing fluff — these are the actual interactions
          you&rsquo;ll have on day one.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {tiles.map((t, i) => (
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
            {t.component}
            <p className="mt-3 px-1 text-sm text-ink-400 leading-relaxed">
              {t.body}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink-800 bg-ink-900/40 px-6 py-5">
        <div>
          <p className="font-display font-bold text-ink-50">
            Ready for the real thing?
          </p>
          <p className="text-sm text-ink-400">
            12,418 verified specialists. Free 15-min intro with every coach.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-semibold px-5 h-11 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          Find your specialist <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
