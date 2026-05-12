"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { TRAINERS } from "@/lib/data";
import { TrainerCard } from "./trainer-card";
import { formatCompact } from "@/lib/utils";

export function TrainersGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="eyebrow">Featured specialists</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
            Real specialists. <span className="gradient-text">Real results.</span>
          </h2>
          <p className="mt-4 text-ink-400 text-lg max-w-xl">
            Hand-picked from {formatCompact(12418)} verified coaches across 10 sports. Average
            of 10.4 years coaching, 96% client retention.
          </p>
        </div>
        <Link
          href="/discover"
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/40 px-4 py-2 text-sm font-semibold text-ink-100 hover:border-brand-400/40 hover:bg-ink-900/70 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          See all 12,418
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TRAINERS.slice(0, 8).map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
          >
            <TrainerCard t={t} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
