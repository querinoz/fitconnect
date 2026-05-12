"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  HeartPulse,
  Moon,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import Link from "next/link";

export function DashboardPreview() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24">
      <div className="absolute inset-x-6 top-12 -z-10 h-[480px] rounded-3xl bg-radial-fade" />
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <p className="eyebrow">Athlete OS</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight">
            A dashboard built for{" "}
            <span className="gradient-text">science-grade</span> training. Not a step counter.
          </h2>
          <p className="mt-5 text-ink-300 text-lg">
            HRV. Sleep correlation. Polarised intensity distribution. A daily Readiness score
            that travels straight to your coach. Same tools D1 programs run on — minus the
            university budget.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              {
                icon: HeartPulse,
                color: "text-signal-400",
                title: "Daily Readiness",
                body: "HRV, sleep, soreness, training load — one score, green/amber/red."
              },
              {
                icon: Brain,
                color: "text-plasma-400",
                title: "AI workout suggestions",
                body: "Your coach&apos;s plan, auto-adjusted to last night&apos;s data."
              },
              {
                icon: Moon,
                color: "text-brand-300",
                title: "Sleep correlation",
                body: "We pull from Apple Watch, Garmin or Whoop. No double-logging."
              },
              {
                icon: TrendingUp,
                color: "text-accent-400",
                title: "Goal tracking that doesn't lie",
                body: "Set a real metric, watch your trajectory week over week."
              }
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-lg bg-ink-900 ring-1 ring-ink-800 ${f.color}`}
                >
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink-100">{f.title}</p>
                  <p className="text-sm text-ink-400">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 font-semibold"
          >
            Open the demo dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 order-1 lg:order-2 relative"
        >
          <div className="rounded-3xl border border-ink-800 bg-ink-900/70 shadow-elevated overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-800 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
              <span className="ml-3 text-xs text-ink-500 font-mono">
                fitconnect.app / dashboard
              </span>
            </div>
            <div className="p-6 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1 rounded-2xl border border-ink-800 bg-ink-950/60 p-4 flex flex-col items-center">
                <p className="text-[10px] uppercase tracking-widest text-ink-500">
                  Readiness
                </p>
                <svg
                  viewBox="0 0 80 80"
                  className="my-2 h-24 w-24 -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="7"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="transparent"
                    stroke="url(#dashRing)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * 0.18}
                  />
                  <defs>
                    <linearGradient id="dashRing" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                </svg>
                <p className="font-display text-3xl font-bold gradient-text">82</p>
                <p className="text-[11px] text-accent-400 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Train hard
                </p>
              </div>

              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                <Tile
                  icon={HeartPulse}
                  color="text-signal-400"
                  label="HRV"
                  value="68 ms"
                  delta="+4"
                />
                <Tile
                  icon={Moon}
                  color="text-brand-300"
                  label="Sleep"
                  value="7h 42m"
                  delta="89%"
                />
                <Tile
                  icon={Activity}
                  color="text-accent-400"
                  label="Load (7d)"
                  value="6,420"
                  delta="optimal"
                />
                <Tile
                  icon={TrendingUp}
                  color="text-plasma-400"
                  label="VO₂max"
                  value="52.4"
                  delta="+1.2"
                />
              </div>

              <div className="sm:col-span-3 rounded-2xl border border-ink-800 bg-ink-950/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-ink-100">7-day load</p>
                  <span className="text-[10px] uppercase tracking-widest text-accent-400 font-semibold">
                    Polarised · 80/20
                  </span>
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[55, 30, 80, 25, 92, 40, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-md bg-gradient-to-t from-brand-500 to-accent-500"
                      style={{ height: `${h}%`, opacity: 0.6 + i * 0.05 }}
                    />
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3 rounded-2xl border border-plasma-500/30 bg-plasma-500/5 p-4 flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-plasma-500/10 text-plasma-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-100">
                    AI suggestion · move tomorrow&apos;s threshold to Thursday
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    HRV down 8 ms, sleep efficiency 76%. Diego has been notified.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="text-ink-100 font-semibold">PR streak · 5 weeks</p>
              <p className="text-ink-400">Best in 18 months</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Tile({
  icon: Icon,
  color,
  label,
  value,
  delta
}: {
  icon: any;
  color: string;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/60 p-3">
      <div className={`grid h-8 w-8 place-items-center rounded-lg bg-ink-900 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-ink-500">
        {label}
      </p>
      <p className="font-display text-xl font-bold tabular-nums text-ink-50">{value}</p>
      <p className="text-[11px] text-accent-400">{delta}</p>
    </div>
  );
}
