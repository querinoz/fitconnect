"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  HeartPulse,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "./ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const yImage = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yBlob = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-28">
      <div className="absolute inset-0 -z-10 gradient-bg" />
      <motion.div
        style={{ y: yBlob }}
        className="absolute inset-x-0 top-0 -z-10 h-[720px] bg-grid-dark bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]"
      />
      <div className="absolute -top-32 -right-24 -z-10 h-[420px] w-[420px] rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 -z-10 h-[420px] w-[420px] rounded-full bg-accent-500/15 blur-3xl" />
      <div className="absolute -bottom-20 right-1/4 -z-10 h-[280px] w-[280px] rounded-full bg-plasma-500/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-brand-500/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            Live · 12,418 verified specialists across 10 sports
          </motion.span>

          <h1 className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[0.95]">
            The world&apos;s best{" "}
            <span className="gradient-text">specialists</span>.<br />
            Verified. Vetted. Yours.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl text-balance">
            Future coaches generic. Caliber coaches strength.{" "}
            <span className="text-ink-100 font-medium">FitConnect coaches</span>{" "}
            Vinyasa, BJJ, climbing, surf — every sport, by the people who live it. With
            science-grade tools usually reserved for D1 athletes.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/discover">
                Find my specialist <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/methodology">How we vet coaches</Link>
            </Button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-5 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[47, 12, 32, 14, 49].map((id) => (
                  <img
                    key={id}
                    src={`https://i.pravatar.cc/64?img=${id}`}
                    alt=""
                    className="h-9 w-9 rounded-full ring-2 ring-ink-950"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-2 text-ink-100 font-semibold text-sm">4.94</span>
                </div>
                <p className="text-xs text-ink-400">27,840 verified reviews</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/10 text-accent-500 ring-1 ring-accent-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-ink-100">62% rejected</p>
                <p className="text-xs text-ink-400">Only the top specialists make it on</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <motion.div
            style={{ y: yImage }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-ink-800 shadow-elevated"
          >
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1100&auto=format&fit=crop"
              alt="Athlete training"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
            <div className="absolute inset-0 bg-noise opacity-40 mix-blend-overlay" />

            {/* coach card */}
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl glass p-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/80?img=58"
                  alt=""
                  className="h-12 w-12 rounded-full ring-2 ring-brand-400/40"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-50 truncate">Mateo Rinaldi</p>
                  <p className="text-xs text-ink-400 truncate">
                    Cycling · Girona · 312 athletes coached
                  </p>
                </div>
                <Button size="sm">Book</Button>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-300">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.93
                </span>
                <span>·</span>
                <span>FTP Builder · 614 joined</span>
                <span>·</span>
                <span>€50/h</span>
              </div>
            </div>
          </motion.div>

          {/* floating search */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="absolute -left-4 lg:-left-10 top-[26%] hidden md:flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-elevated"
          >
            <Search className="h-4 w-4 text-brand-400" />
            <div className="text-sm">
              <p className="text-ink-100 font-medium">Surfing · Lisbon</p>
              <p className="text-ink-500 text-xs">48 specialists · from €35/h</p>
            </div>
          </motion.div>

          {/* recovery ring */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute -right-4 lg:-right-8 top-[8%] hidden md:flex flex-col items-center gap-2 rounded-2xl glass p-4 shadow-elevated w-[148px]"
          >
            <RecoveryRing value={84} />
            <p className="text-xs uppercase tracking-widest text-ink-400">Readiness</p>
            <p className="text-[11px] text-accent-400 font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Train hard today
            </p>
          </motion.div>

          {/* PR card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -right-2 bottom-1/3 hidden lg:flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-elevated"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-signal-500/10 text-signal-400">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="text-ink-100 font-medium">HRV 68 ms</p>
              <p className="text-[11px] text-ink-400">+4 vs 30-day avg</p>
            </div>
          </motion.div>

          {/* AI nudge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -left-2 -bottom-2 hidden lg:flex items-center gap-3 rounded-2xl glass px-4 py-3 shadow-elevated max-w-[260px]"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-plasma-500/10 text-plasma-400 ring-1 ring-plasma-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="text-ink-100 font-medium">AI suggestion</p>
              <p className="text-[11px] text-ink-400">Move Saturday&apos;s long run to Sunday</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function RecoveryRing({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative h-[88px] w-[88px]">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="url(#ringGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display font-bold text-2xl tabular-nums">{value}</p>
          <p className="text-[9px] text-ink-400 uppercase tracking-widest">/100</p>
        </div>
      </div>
    </div>
  );
}
