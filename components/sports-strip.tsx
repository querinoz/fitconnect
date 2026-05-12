"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SPORTS } from "@/lib/data";

const meta: Record<
  string,
  { icon: string; coaches: number; from: number; tint: string }
> = {
  Yoga: { icon: "🧘", coaches: 1842, from: 35, tint: "from-emerald-500/10 to-transparent" },
  Strength: { icon: "🏋️", coaches: 2168, from: 40, tint: "from-amber-500/10 to-transparent" },
  Surf: { icon: "🏄", coaches: 412, from: 50, tint: "from-sky-500/10 to-transparent" },
  Climbing: { icon: "🧗", coaches: 624, from: 45, tint: "from-orange-500/10 to-transparent" },
  "Martial Arts": {
    icon: "🥋",
    coaches: 1041,
    from: 40,
    tint: "from-red-500/10 to-transparent"
  },
  Running: { icon: "🏃", coaches: 1986, from: 30, tint: "from-lime-500/10 to-transparent" },
  Swimming: {
    icon: "🏊",
    coaches: 738,
    from: 38,
    tint: "from-cyan-500/10 to-transparent"
  },
  Cycling: { icon: "🚴", coaches: 1424, from: 35, tint: "from-blue-500/10 to-transparent" },
  CrossFit: {
    icon: "💪",
    coaches: 956,
    from: 38,
    tint: "from-yellow-500/10 to-transparent"
  },
  Boxing: { icon: "🥊", coaches: 1227, from: 40, tint: "from-rose-500/10 to-transparent" }
};

export function SportsStrip() {
  return (
    <section className="border-y border-ink-800/60 bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-baseline justify-between flex-wrap gap-4 mb-7">
          <div>
            <p className="eyebrow">10 sports. 0 generalists.</p>
            <h3 className="mt-2 font-display text-xl md:text-2xl font-bold">
              A specialist for every discipline
            </h3>
          </div>
          <p className="text-xs text-ink-500">
            Hover a tile · live counts updated 5 minutes ago
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {SPORTS.map((s, i) => {
            const m = meta[s];
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link
                  href={`/discover?sport=${encodeURIComponent(s)}`}
                  className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-ink-800 bg-ink-900/40 px-3 py-4 hover:border-brand-400/50 transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${m.tint} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <span className="relative text-2xl">{m.icon}</span>
                  <span className="relative text-xs font-semibold text-ink-200 group-hover:text-ink-50">
                    {s}
                  </span>
                  <span className="relative text-[10px] text-ink-500 tabular-nums">
                    {m.coaches.toLocaleString()} · from €{m.from}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
