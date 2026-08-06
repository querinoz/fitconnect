"use client";

import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { TRAINERS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";
import { FitMeModal } from "@/components/fit-me-modal";
import { useState } from "react";

const SPORT_ICONS: Record<string, string> = {
  Yoga: "🧘",
  Strength: "🏋️",
  Surf: "🏄",
  Climbing: "🧗",
  "Martial Arts": "🥋",
  Running: "🏃",
  Swimming: "🏊",
  Cycling: "🚴",
  CrossFit: "⚡",
  Boxing: "🥊"
};

const FEATURED = TRAINERS.slice(0, 4);

export function FeaturedCoaches() {
  const locale = useLocale();
  const t = locale.featuredCoaches;
  const reduce = useReducedMotion();
  const [fitMeCoach, setFitMeCoach] = useState<(typeof FEATURED)[0] | null>(null);

  return (
    <section className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-balance md:text-5xl">
            {t.title}{" "}
            <span className="gradient-text">{t.titleAccent}</span>
          </h2>
          <p className="mt-4 text-lg text-ink-400">{t.subtitle}</p>
        </div>
        <Link
          href="/discover"
          className="shrink-0 text-sm font-semibold text-brand-300 hover:text-brand-200"
        >
          {t.seeAll} →
        </Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED.map((coach, i) => {
          const sport = coach.sports[0] ?? "Strength";
          const icon = SPORT_ICONS[sport] ?? "💪";
          return (
            <motion.article
              key={coach.id}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : i * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900/40 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-volt-500/35 hover:shadow-[0_0_40px_-12px_var(--volt-glow)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coach.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-xs font-bold text-volt-400 ring-1 ring-volt-500/30 backdrop-blur">
                  <BadgeCheck aria-hidden className="h-3 w-3" />
                  {t.verified}
                </span>
                <span className="absolute right-3 top-3 text-2xl" aria-hidden>
                  {icon}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="h-11 w-11 rounded-full ring-2 ring-ink-800 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display font-semibold text-ink-50">
                      {coach.name}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-ink-400">
                      <MapPin aria-hidden className="h-3 w-3 shrink-0" />
                      {coach.city}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Star aria-hidden className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold tabular-nums text-ink-100">
                    {coach.rating.toFixed(2)}
                  </span>
                  <span className="text-ink-500">·</span>
                  <span className="text-ink-400">
                    {coach.athletesCoached} {t.sessions}
                  </span>
                </div>

                <p className="mt-2 text-lg font-bold text-volt-400">
                  {formatPrice(coach.hourlyRate)}
                  <span className="text-sm font-normal text-ink-500">{t.perHour}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setFitMeCoach(coach)}
                  className="mt-4 w-full rounded-xl bg-volt-500 py-2.5 text-sm font-bold text-ink-950 shadow-volt-glow transition-colors hover:bg-volt-400"
                >
                  {t.bookIntro}
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {fitMeCoach && (
        <FitMeModal
          open={!!fitMeCoach}
          onOpenChange={(o) => !o && setFitMeCoach(null)}
          trainer={fitMeCoach}
        />
      )}
    </section>
  );
}
