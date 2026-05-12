"use client";

import { motion } from "framer-motion";
import { Globe2, RefreshCw, Star, Users, Zap } from "lucide-react";
import { STATS } from "@/lib/data";
import { formatCompact, pct } from "@/lib/utils";

const stats = [
  {
    icon: Users,
    value: formatCompact(STATS.athletes),
    label: "Active athletes"
  },
  {
    icon: Zap,
    value: formatCompact(STATS.trainers),
    label: "Verified specialists"
  },
  {
    icon: RefreshCw,
    value: formatCompact(STATS.sessions),
    label: "Sessions completed"
  },
  {
    icon: Globe2,
    value: `${STATS.countries}`,
    label: "Countries · 6 continents"
  },
  {
    icon: Star,
    value: STATS.avgRating.toFixed(2),
    label: "Average coach rating"
  },
  {
    icon: RefreshCw,
    value: pct(STATS.rebookRate),
    label: "Athletes rebook within 30 days"
  }
];

export function StatBar() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-3xl border border-ink-800/80 bg-ink-900/40 p-1">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-ink-800/60">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-6 text-center"
            >
              <div className="mx-auto grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300">
                <s.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold tabular-nums gradient-text">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-400 leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
