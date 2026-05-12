"use client";

import { Check, Minus, X } from "lucide-react";
import { motion } from "framer-motion";
import { COMPARISON } from "@/lib/data";

const competitors = [
  { id: "fitconnect", name: "FitConnect", highlight: true },
  { id: "future", name: "Future" },
  { id: "caliber", name: "Caliber" },
  { id: "trainerize", name: "Trainerize" },
  { id: "classpass", name: "ClassPass" }
];

function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-400 ring-1 ring-accent-500/30">
        <Check className="h-3 w-3" /> Yes
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-800/60 px-2.5 py-1 text-xs font-medium text-ink-500 ring-1 ring-ink-700">
        <X className="h-3 w-3" /> No
      </span>
    );
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        highlight
          ? "bg-brand-500/10 text-brand-200 ring-1 ring-brand-500/30"
          : "bg-ink-800/60 text-ink-300 ring-1 ring-ink-700"
      }`}
    >
      <Minus className="h-3 w-3 opacity-60" /> {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">Why FitConnect</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          Future is good. We&apos;re for athletes with a real{" "}
          <span className="gradient-text">sport</span>.
        </h2>
        <p className="mt-4 text-lg text-ink-400">
          Side-by-side with the players you&apos;ve heard of — assessed honestly, no asterisks.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-10 overflow-x-auto rounded-3xl border border-ink-800 bg-ink-900/40"
      >
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-ink-800">
              <th className="text-left text-xs uppercase tracking-widest text-ink-500 px-6 py-5 font-semibold">
                Feature
              </th>
              {competitors.map((c) => (
                <th
                  key={c.id}
                  className={`text-center text-sm font-display font-bold px-3 py-5 ${
                    c.highlight
                      ? "text-ink-50 bg-gradient-to-b from-brand-500/10 to-transparent"
                      : "text-ink-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{c.name}</span>
                    {c.highlight && (
                      <span className="rounded-full bg-brand-400 text-ink-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Us
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-ink-800/60 last:border-0 ${
                  i % 2 === 1 ? "bg-ink-900/30" : ""
                }`}
              >
                <td className="text-left text-sm text-ink-200 px-6 py-4 font-medium">
                  {row.feature}
                </td>
                <td className="text-center px-3 py-4 bg-brand-500/5">
                  <Cell value={row.fitconnect} highlight />
                </td>
                <td className="text-center px-3 py-4">
                  <Cell value={row.future} />
                </td>
                <td className="text-center px-3 py-4">
                  <Cell value={row.caliber} />
                </td>
                <td className="text-center px-3 py-4">
                  <Cell value={row.trainerize} />
                </td>
                <td className="text-center px-3 py-4">
                  <Cell value={row.classpass} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <p className="mt-4 text-xs text-ink-500 text-center">
        Pricing and features verified Q1 2026 from public sources. We&apos;ll update this table
        anytime a competitor closes the gap — happily.
      </p>
    </section>
  );
}
