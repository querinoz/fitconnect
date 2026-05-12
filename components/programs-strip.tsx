"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { PROGRAMS, TRAINERS } from "@/lib/data";
import { formatPrice, formatCompact } from "@/lib/utils";

export function ProgramsStrip() {
  const featured = PROGRAMS.slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="eyebrow">Signature programs</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
            Battle-tested programs by the{" "}
            <span className="gradient-text">coaches that wrote them</span>.
          </h2>
        </div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 text-sm font-semibold"
        >
          Browse all 84 programs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => {
          const coach = TRAINERS.find((t) => t.id === p.trainerId);
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="group relative rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40 hover:border-brand-400/50 transition-all hover:-translate-y-1"
            >
              <Link href="/programs" className="absolute inset-0 z-10" aria-hidden />
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={p.cover}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-ink-950/70 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink-100">
                    {p.sport}
                  </span>
                  <span className="rounded-full bg-ink-950/70 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink-100">
                    {p.level}
                  </span>
                </div>
                {p.badge && (
                  <span className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 text-ink-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display font-bold text-xl text-ink-50 leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-ink-300 mt-1 line-clamp-1">{p.tagline}</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {coach && (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-100 truncate">
                        {coach.name}
                      </p>
                      <p className="text-[11px] text-ink-500 truncate">
                        {coach.headline}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-ink-400 pt-2 border-t border-ink-800/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {p.weeks} wks
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {formatCompact(p.joined)}
                  </span>
                  <span className="font-semibold text-ink-100">
                    {formatPrice(p.price)}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
