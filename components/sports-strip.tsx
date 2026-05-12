"use client";

import Link from "next/link";
import { SPORTS } from "@/lib/data";

const icons: Record<string, string> = {
  Yoga: "🧘",
  Strength: "🏋️",
  Surf: "🏄",
  Climbing: "🧗",
  "Martial Arts": "🥋",
  Running: "🏃",
  Swimming: "🏊",
  Cycling: "🚴",
  CrossFit: "💪",
  Boxing: "🥊"
};

export function SportsStrip() {
  return (
    <section className="border-y border-ink-800/60 bg-ink-900/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs uppercase tracking-widest text-ink-500 mb-5">
          A specialist for every discipline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {SPORTS.map((s) => (
            <Link
              key={s}
              href={`/discover?sport=${encodeURIComponent(s)}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-ink-800 bg-ink-900/40 px-3 py-4 hover:border-brand-400/60 transition-colors"
            >
              <span className="text-2xl">{icons[s]}</span>
              <span className="text-xs font-medium text-ink-300 group-hover:text-ink-50">
                {s}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
