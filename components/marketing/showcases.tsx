"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Three stacked functionality showcases — the "what does this app
 * actually let me do?" answer the marketing brief asks for.
 *
 * Each showcase pairs:
 *  - a real-people photo (left or right, alternating)
 *  - a mini in-code mockup of the actual interaction
 *  - a short benefit copy + a CTA pointing at the real sub-route
 *
 * Mockups are intentionally hand-rolled SVG/HTML — recharts is too
 * heavy for sub-300px previews and we want the visuals to load before
 * any chart library hydrates.
 */
export function Showcases() {
  return (
    <section
      id="showcases"
      aria-labelledby="fc-showcases-title"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Inside the product
        </p>
        <h2
          id="fc-showcases-title"
          className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight"
        >
          The three flows you&rsquo;ll{" "}
          <span className="gradient-text">use every week</span>.
        </h2>
        <p className="mt-4 text-ink-300 text-lg">
          Filter, book, train. We&rsquo;ve obsessed over the friction in each
          step until they take seconds — not minutes.
        </p>
      </div>

      <div className="mt-14 space-y-20 md:space-y-28">
        <ShowcaseDiscover />
        <ShowcaseBooking />
        <ShowcaseProgress />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — Find your specialist coach                                     */
/* ------------------------------------------------------------------ */

function ShowcaseDiscover() {
  const reduce = useReducedMotion();
  return (
    <ShowcaseRow
      eyebrow="01 · Discover"
      title={
        <>
          Find your <span className="gradient-text">specialist coach</span> in
          a couple of taps.
        </>
      }
      body="Filter by sport, modality, language and budget. Every result is verified — and every coach offers a free 15-minute intro call before you commit."
      cta={{ href: "/discover", label: "Browse coaches" }}
      photo={{
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop",
        alt: "A coach guiding an athlete through strength work in a gym",
        captionTitle: "Coach Matt K.",
        captionBody: "Strength · Berlin · 4.96★",
        side: "right"
      }}
    >
      <DiscoverMockup reduce={!!reduce} />
    </ShowcaseRow>
  );
}

function DiscoverMockup({ reduce }: { reduce: boolean }) {
  const coaches = [
    {
      name: "Marina Costa",
      sport: "Yoga",
      city: "Lisbon",
      rate: 45,
      rating: 4.97,
      avatar: "https://i.pravatar.cc/120?img=47"
    },
    {
      name: "Tomás Reyes",
      sport: "Strength",
      city: "Madrid",
      rate: 60,
      rating: 4.92,
      avatar: "https://i.pravatar.cc/120?img=12"
    },
    {
      name: "Hana Okafor",
      sport: "Surf",
      city: "Ericeira",
      rate: 70,
      rating: 4.99,
      avatar: "https://i.pravatar.cc/120?img=32"
    }
  ];
  return (
    <div
      className="relative rounded-3xl border border-ink-800 bg-ink-950/80 shadow-elevated overflow-hidden"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      <div className="flex items-center gap-2 border-b border-ink-800/80 px-5 py-3 bg-ink-950/60">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
        <span className="ml-3 text-[11px] text-ink-500 font-mono tabular-nums">
          fitconnect.app / discover
        </span>
      </div>

      <div className="p-5 grid gap-4">
        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2 flex-1 min-w-[200px]">
            <Search aria-hidden="true" className="h-3.5 w-3.5 text-ink-500" />
            <span className="text-xs text-ink-400">e.g. Yoga, Lisbon</span>
          </div>
          <Filter aria-hidden="true" className="h-3.5 w-3.5 text-ink-400" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["Yoga", "Strength", "Climbing", "Surf", "Running", "BJJ"].map(
            (s, i) => (
              <span
                key={s}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                  i === 0
                    ? "bg-brand-500/15 text-brand-200 ring-brand-500/40"
                    : "bg-ink-900/60 text-ink-300 ring-ink-800"
                )}
              >
                {s}
              </span>
            )
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-ink-500">
              <span>Modality</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
              <span className="rounded-md bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/30 py-1 text-center font-semibold">
                Online
              </span>
              <span className="rounded-md bg-ink-950/40 text-ink-400 ring-1 ring-ink-800 py-1 text-center">
                In-person
              </span>
              <span className="rounded-md bg-ink-950/40 text-ink-400 ring-1 ring-ink-800 py-1 text-center">
                Hybrid
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-ink-500">
              <span>Max €/h</span>
              <span className="text-ink-200 font-semibold tabular-nums">€60</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-ink-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500",
                  !reduce && "fc-bar-pop"
                )}
                style={{ width: "65%", transformOrigin: "left center" }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-2">
          {coaches.map((c, i) => (
            <div
              key={c.name}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/40 p-2.5 hover:border-brand-400/40 transition-colors",
                !reduce && "fc-step-rise"
              )}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatar}
                alt=""
                className="h-9 w-9 rounded-lg ring-1 ring-ink-800 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-ink-100 leading-tight truncate">
                  {c.name}
                </p>
                <p className="text-[10px] text-ink-400 truncate">
                  {c.sport} · {c.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-amber-400 inline-flex items-center gap-1">
                  <Star aria-hidden="true" className="h-3 w-3 fill-current" />
                  {c.rating.toFixed(2)}
                </p>
                <p className="text-[10px] text-ink-400 tabular-nums">
                  €{c.rate}/h
                </p>
              </div>
              <ChevronRight
                aria-hidden="true"
                className="h-3.5 w-3.5 text-ink-500"
              />
            </div>
          ))}
        </div>

        <p className="text-[10px] text-ink-500">
          Showing 3 of 312 verified specialists matching{" "}
          <span className="text-brand-300 font-semibold">Yoga · Online · €60/h</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — Book in seconds                                                */
/* ------------------------------------------------------------------ */

function ShowcaseBooking() {
  return (
    <ShowcaseRow
      eyebrow="02 · Book"
      title={
        <>
          Book a session in{" "}
          <span className="gradient-text">under 30 seconds</span>.
        </>
      }
      body="Two-way calendar sync. Time-zone aware. Auto-rebook your favourite slot every week. Stripe Connect handles every euro — no card-juggling on session day."
      cta={{ href: "/discover", label: "Book a coach" }}
      photo={{
        src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80&auto=format&fit=crop",
        alt: "A coach leading an athlete through breathwork in a calm studio",
        captionTitle: "Coach Marina C.",
        captionBody: "Yoga · Lisbon · responds in ~1h",
        side: "left"
      }}
    >
      <BookingMockup />
    </ShowcaseRow>
  );
}

function BookingMockup() {
  const slots = [
    { time: "07:00", taken: false },
    { time: "08:30", taken: true },
    { time: "10:00", taken: false, selected: true },
    { time: "12:00", taken: false },
    { time: "17:30", taken: false },
    { time: "19:00", taken: true }
  ];
  const days = [
    { d: "Mon", n: 12 },
    { d: "Tue", n: 13, today: true },
    { d: "Wed", n: 14 },
    { d: "Thu", n: 15 },
    { d: "Fri", n: 16 },
    { d: "Sat", n: 17 },
    { d: "Sun", n: 18 }
  ];

  return (
    <div
      className="relative rounded-3xl border border-ink-800 bg-ink-950/80 shadow-elevated overflow-hidden"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      <div className="flex items-center gap-2 border-b border-ink-800/80 px-5 py-3 bg-ink-950/60">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
        <span className="ml-3 text-[11px] text-ink-500 font-mono tabular-nums">
          fitconnect.app / book
        </span>
      </div>

      <div className="p-5 grid gap-4">
        {/* Coach header */}
        <div className="flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/40 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/120?img=47"
            alt=""
            className="h-10 w-10 rounded-xl ring-1 ring-brand-500/30 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-ink-100 leading-tight truncate">
              Marina Costa · Yoga
            </p>
            <p className="text-[10px] text-ink-400 inline-flex items-center gap-1">
              <Video aria-hidden="true" className="h-3 w-3" /> 60 min · Online ·
              €45
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-accent-400 font-bold">
            Free intro 15&apos;
          </span>
        </div>

        {/* Calendar week */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-ink-200 inline-flex items-center gap-1.5">
              <Calendar
                aria-hidden="true"
                className="h-3.5 w-3.5 text-brand-300"
              />
              May 12 — May 18
            </p>
            <p className="text-[10px] text-ink-500">Lisbon · UTC+1</p>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => (
              <button
                key={d.n}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={cn(
                  "rounded-lg py-1.5 text-center text-[10px] ring-1 transition-colors",
                  d.today
                    ? "bg-brand-500/15 ring-brand-500/40 text-brand-200 font-bold"
                    : "bg-ink-950/40 ring-ink-800 text-ink-300 hover:bg-ink-900/60"
                )}
              >
                <span className="block uppercase tracking-wider text-[8px] text-ink-500">
                  {d.d}
                </span>
                <span className="font-semibold tabular-nums">{d.n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-ink-500 mb-2">
            Tuesday May 13 · 6 slots
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {slots.map((s, i) => (
              <span
                key={s.time}
                className={cn(
                  "rounded-lg py-1.5 text-center text-[11px] font-semibold ring-1 transition-colors fc-step-rise",
                  s.taken &&
                    "bg-ink-950/40 ring-ink-800 text-ink-600 line-through",
                  !s.taken &&
                    !s.selected &&
                    "bg-ink-900/60 ring-ink-800 text-ink-200",
                  s.selected &&
                    "bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 ring-brand-400 shadow-lg shadow-brand-500/20"
                )}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {s.time}
              </span>
            ))}
          </div>
        </div>

        {/* Confirm strip */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent-500/30 bg-accent-500/5 p-3">
          <div className="flex items-center gap-2 text-[11px] text-ink-100">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-500/15 text-accent-400">
              <Check aria-hidden="true" className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-semibold leading-tight">
                Tue 13 May · 10:00–11:00
              </p>
              <p className="text-[10px] text-ink-400">
                Auto-rebook every Tuesday
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 text-[11px] font-bold px-3 py-1.5">
            Confirm · €45
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — Track real progress                                            */
/* ------------------------------------------------------------------ */

function ShowcaseProgress() {
  return (
    <ShowcaseRow
      eyebrow="03 · Progress"
      title={
        <>
          Watch your <span className="gradient-text">progress chart</span>{" "}
          tell the truth.
        </>
      }
      body="HRV, sleep, training load and your sport-specific PR — one chart, one weekly trend, one number your coach can act on. Auto-syncs from Apple Watch, Garmin, Whoop or Polar."
      cta={{ href: "/dashboard", label: "Open the dashboard" }}
      photo={{
        src: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=900&q=80&auto=format&fit=crop",
        alt: "An athlete checking her smartwatch mid-run on a coastal trail",
        captionTitle: "Athlete Aoife C.",
        captionBody: "Marathon · Dublin · −11 min PB",
        side: "right"
      }}
    >
      <ProgressMockup />
    </ShowcaseRow>
  );
}

function ProgressMockup() {
  // 12 weekly points — used by the trend line and 12-week strip below.
  const points = [42, 44, 41, 46, 48, 47, 50, 49, 53, 52, 55, 58];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min)) * 100;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div
      className="relative rounded-3xl border border-ink-800 bg-ink-950/80 shadow-elevated overflow-hidden"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      <div className="flex items-center gap-2 border-b border-ink-800/80 px-5 py-3 bg-ink-950/60">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
        <span className="ml-3 text-[11px] text-ink-500 font-mono tabular-nums">
          fitconnect.app / dashboard
        </span>
      </div>

      <div className="p-5 grid gap-4">
        {/* Header KPIs */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-500">
              VO₂max trend · 12 weeks
            </p>
            <p className="font-display text-3xl font-bold gradient-text leading-none tabular-nums mt-1">
              52.4
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-ink-500">
              vs week 1
            </p>
            <p className="text-accent-400 text-sm font-semibold inline-flex items-center gap-1">
              <TrendingUp aria-hidden="true" className="h-3.5 w-3.5" /> +10.4
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
          <svg
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
            className="h-32 w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="fcShowcaseTrend"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
              <linearGradient
                id="fcShowcaseFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Soft grid */}
            {[15, 30, 45].map((y) => (
              <line
                key={y}
                x1="0"
                x2="100"
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.4"
              />
            ))}
            {/* Filled area */}
            <path
              d={`${path} L 100 60 L 0 60 Z`}
              fill="url(#fcShowcaseFill)"
            />
            {/* Trend line */}
            <path
              d={path}
              fill="none"
              stroke="url(#fcShowcaseTrend)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="fc-trace"
            />
            {/* Last point */}
            <circle
              cx="100"
              cy={
                100 -
                ((points[points.length - 1] - min) / (max - min)) * 100
              }
              r="1.6"
              fill="#a3e635"
            />
          </svg>
          <div className="mt-2 flex items-center justify-between text-[9px] text-ink-500 tabular-nums">
            <span>W1</span>
            <span>W4</span>
            <span>W8</span>
            <span className="text-accent-400 font-semibold">W12</span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "HRV",
              value: "68 ms",
              delta: "+4",
              tone: "text-signal-400 bg-signal-500/10 ring-signal-500/30"
            },
            {
              label: "Sleep",
              value: "7h 42m",
              delta: "89%",
              tone: "text-brand-300 bg-brand-500/10 ring-brand-500/30"
            },
            {
              label: "5 km PB",
              value: "19:42",
              delta: "−18s",
              tone: "text-accent-400 bg-accent-500/10 ring-accent-500/30"
            }
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-ink-800 bg-ink-900/40 p-2.5"
            >
              <p className="text-[9px] uppercase tracking-widest text-ink-500">
                {k.label}
              </p>
              <p className="font-display text-base font-bold tabular-nums text-ink-50 mt-1">
                {k.value}
              </p>
              <p
                className={cn(
                  "mt-0.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ring-1",
                  k.tone
                )}
              >
                {k.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Coach action band */}
        <div className="flex items-center gap-3 rounded-xl border border-plasma-500/30 bg-plasma-500/5 p-3">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-plasma-500/15 text-plasma-300">
            <Wand2 aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] text-ink-200 leading-snug flex-1">
            <span className="font-semibold text-ink-50">Diego suggests</span>{" "}
            shifting Saturday&apos;s long run to Sunday — your HRV is trending
            up.
          </p>
          <span className="rounded-full bg-plasma-500/15 text-plasma-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            Apply
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared row layout                                                   */
/* ------------------------------------------------------------------ */

type ShowcaseRowProps = {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  cta: { href: string; label: string };
  photo: {
    src: string;
    alt: string;
    captionTitle: string;
    captionBody: string;
    side: "left" | "right";
  };
  children: React.ReactNode;
};

function ShowcaseRow({
  eyebrow,
  title,
  body,
  cta,
  photo,
  children
}: ShowcaseRowProps) {
  const reduce = useReducedMotion();
  const photoRight = photo.side === "right";
  return (
    <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
      {/* Mockup column — always lg:col-span-7, swap order for variety */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduce ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "lg:col-span-7 relative",
          photoRight ? "lg:order-1" : "lg:order-2"
        )}
      >
        {children}
      </motion.div>

      {/* Copy + photo column */}
      <div
        className={cn(
          "lg:col-span-5",
          photoRight ? "lg:order-2" : "lg:order-1"
        )}
      >
        <p className="text-[10px] uppercase tracking-widest text-brand-300 font-bold">
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display text-3xl md:text-4xl font-bold text-balance leading-tight">
          {title}
        </h3>
        <p className="mt-4 text-ink-300 text-base md:text-lg leading-relaxed">
          {body}
        </p>

        {/* Real photo card */}
        <div className="mt-6 fc-photo-tilt">
          <figure className="relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 fc-photo-mask fc-photo-duotone fc-photo-tilt-inner aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <figcaption className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3 text-ink-50">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold leading-tight truncate">
                  {photo.captionTitle}
                </p>
                <p className="text-[11px] text-ink-300 inline-flex items-center gap-1 mt-0.5 truncate">
                  <MapPin aria-hidden="true" className="h-3 w-3 text-brand-300" />
                  {photo.captionBody}
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-300 ring-1 ring-accent-500/40">
                Verified
              </span>
            </figcaption>
          </figure>
        </div>

        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/40 px-4 py-2.5 text-sm font-semibold text-ink-100 hover:border-brand-400/50 hover:bg-ink-900/70 transition-all"
        >
          {cta.label}
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
