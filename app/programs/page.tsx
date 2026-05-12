"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { DemoBanner } from "@/components/demo-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { PROGRAMS, SPORTS, TRAINERS, type Sport } from "@/lib/data";
import {
  Calendar,
  Search,
  ShieldCheck,
  Users,
  Award,
  Layers
} from "lucide-react";
import { formatPrice, formatCompact } from "@/lib/utils";
import { cn } from "@/lib/utils";

const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof levels)[number];

export default function ProgramsPage() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState<Sport | "All">("All");
  const [level, setLevel] = useState<Level>("All");

  const filtered = useMemo(() => {
    return PROGRAMS.filter((p) => {
      if (sport !== "All" && p.sport !== sport) return false;
      if (level !== "All" && p.level !== level) return false;
      if (q && !`${p.title} ${p.tagline}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, sport, level]);

  const featured = PROGRAMS.find((p) => p.badge === "Bestseller") ?? PROGRAMS[0];
  const featuredCoach = TRAINERS.find((t) => t.id === featured.trainerId);

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <section className="relative overflow-hidden pt-16 pb-12">
          <div className="absolute inset-0 -z-10 gradient-bg opacity-70" />
          <div className="mx-auto max-w-7xl px-6">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Programs library
            </p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
              84 signature programs.<br />
              <span className="gradient-text">Written by the coaches who run them.</span>
            </h1>
            <p className="mt-5 text-ink-300 text-lg max-w-2xl">
              Battle-tested, evidence-based, RPE-autoregulated. Every program ships with weekly
              check-ins from the coach and lifetime access to updates.
            </p>
          </div>
        </section>

        {/* Featured */}
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-8 rounded-3xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10 overflow-hidden">
            <div className="relative aspect-[16/9] lg:aspect-auto">
              <img
                src={featured.cover}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/30 to-transparent" />
              <span className="absolute top-5 left-5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-400 to-accent-500 text-ink-950 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                <Award className="h-3 w-3" /> {featured.badge ?? "Featured"}
              </span>
            </div>
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-widest text-brand-300 font-semibold">
                {featured.sport} · {featured.level} · {featured.weeks} weeks
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
                {featured.title}
              </h2>
              <p className="mt-3 text-ink-300 text-lg">{featured.tagline}</p>
              <p className="mt-3 text-ink-400">{featured.description}</p>
              {featuredCoach && (
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={featuredCoach.avatar}
                    alt={featuredCoach.name}
                    className="h-10 w-10 rounded-full ring-2 ring-ink-950"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink-100">
                      {featuredCoach.name}
                    </p>
                    <p className="text-xs text-ink-500">{featuredCoach.headline}</p>
                  </div>
                </div>
              )}
              <div className="mt-6 flex items-center gap-3">
                <span className="font-display text-3xl font-bold gradient-text">
                  {formatPrice(featured.price)}
                </span>
                <span className="text-sm text-ink-400">
                  · {formatCompact(featured.joined)} athletes joined
                </span>
              </div>
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/trainer/${featured.trainerId}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-semibold text-sm hover:opacity-90"
                >
                  Join the program
                </Link>
                <Link
                  href={`/trainer/${featured.trainerId}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-ink-700 text-ink-100 font-medium text-sm hover:bg-ink-900/50"
                >
                  See sample week
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-5 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search programs…"
                className="w-full bg-ink-950/60 border border-ink-800 rounded-xl pl-9 pr-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSport("All")}
                className={chip(sport === "All")}
              >
                All sports
              </button>
              {SPORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={chip(sport === s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={chip(level === l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mx-auto max-w-7xl px-6 pb-16">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No programs match those filters"
              description="Try a different sport or remove the level constraint."
              cta={{ label: "Browse all programs", href: "/programs" }}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => {
                const coach = TRAINERS.find((t) => t.id === p.trainerId);
                return (
                  <motion.article
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                    className="group rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40 hover:border-brand-400/50 transition-all hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/9]">
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
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-display font-bold text-xl text-ink-50 leading-tight">
                          {p.title}
                        </h3>
                        <p className="text-xs text-ink-300 mt-1 line-clamp-2">
                          {p.tagline}
                        </p>
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
                      <ul className="space-y-1 text-xs text-ink-400">
                        {p.outcomes.slice(0, 2).map((o) => (
                          <li key={o} className="flex items-start gap-1.5">
                            <ShieldCheck className="h-3 w-3 text-accent-400 mt-0.5 shrink-0" />
                            {o}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between text-xs text-ink-400 pt-3 border-t border-ink-800/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {p.weeks} wks
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {formatCompact(p.joined)}
                        </span>
                        <span className="font-semibold text-ink-50 tabular-nums">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}

function chip(active: boolean) {
  return cn(
    "rounded-full px-3 py-1.5 text-xs border transition-colors",
    active
      ? "border-brand-400/60 bg-brand-500/15 text-brand-100"
      : "border-ink-800 bg-ink-950/40 text-ink-300 hover:border-ink-700"
  );
}
