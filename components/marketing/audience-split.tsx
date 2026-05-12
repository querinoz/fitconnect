"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Calendar,
  HeartHandshake,
  LineChart,
  ShieldCheck,
  Sparkles,
  Wallet
} from "lucide-react";

/**
 * Two-audience split.
 *
 * The marketing brief explicitly calls out a dual audience: athletes
 * looking for the right coach, and specialised trainers looking for
 * clients. We give each audience a column with a real photo, three
 * benefit bullets, a metric tag and its own CTA.
 *
 * The composition is intentionally symmetrical — neither audience is
 * the "primary" one; FitConnect needs both sides of the marketplace
 * to feel addressed.
 */
export function AudienceSplit() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-labelledby="fc-audience-title"
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div className="max-w-3xl">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          Built for both sides
        </p>
        <h2
          id="fc-audience-title"
          className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance leading-tight"
        >
          One marketplace.{" "}
          <span className="gradient-text">Two journeys.</span>
        </h2>
        <p className="mt-4 text-ink-300 text-lg">
          Whether you&rsquo;re looking for the right coach or you{" "}
          <em className="not-italic text-ink-100">are</em> the right coach —
          FitConnect was built for the way you want to train.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900/40 hover:border-brand-400/40 transition-colors"
        >
          <PhotoSlab
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1100&q=80&auto=format&fit=crop"
            alt="An athlete mid-set in a strength session"
            tag="For athletes"
            tone="brand"
          />
          <div className="p-7">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-ink-50 leading-tight">
              Train with someone who actually{" "}
              <span className="gradient-text">knows your sport</span>.
            </h3>
            <p className="mt-3 text-ink-300 text-sm md:text-base leading-relaxed">
              No more generalist plans. Filter by sport, modality, language and
              budget. Talk to your coach for free first. Switch any time —
              your athlete profile travels with you.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {ATHLETE_POINTS.map((p) => (
                <li
                  key={p.title}
                  className="flex items-start gap-3 text-ink-200"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                    <p.icon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-50 leading-tight">
                      {p.title}
                    </p>
                    <p className="text-ink-400 leading-snug">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex items-center justify-between gap-4">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-ink-950 font-bold px-5 py-2.5 text-sm shadow-lg shadow-brand-500/15 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
              >
                Find your coach
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-ink-500 leading-tight text-right">
                Free to browse
                <br />
                <span className="text-ink-300 font-semibold">
                  €12/mo + bookings
                </span>
              </p>
            </div>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: reduce ? 0 : 0.6,
            delay: reduce ? 0 : 0.08,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="group relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900/40 hover:border-signal-400/40 transition-colors"
        >
          <PhotoSlab
            src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1100&q=80&auto=format&fit=crop"
            alt="A coach demonstrating technique to an athlete"
            tag="For coaches"
            tone="signal"
          />
          <div className="p-7">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-ink-50 leading-tight">
              Keep <span className="gradient-text-warm">85%</span> of every
              euro. Run your full coaching business in one app.
            </h3>
            <p className="mt-3 text-ink-300 text-sm md:text-base leading-relaxed">
              The highest take-home rate on any specialised marketplace.
              Calendar, video room, payments, programs and athlete dashboards
              — under one roof, with a roster of motivated athletes already
              looking for someone like you.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {COACH_POINTS.map((p) => (
                <li
                  key={p.title}
                  className="flex items-start gap-3 text-ink-200"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-signal-500/10 text-signal-400 ring-1 ring-signal-500/30">
                    <p.icon aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink-50 leading-tight">
                      {p.title}
                    </p>
                    <p className="text-ink-400 leading-snug">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex items-center justify-between gap-4">
              <Link
                href="/trainer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-signal-500 to-plasma-500 text-ink-50 font-bold px-5 py-2.5 text-sm shadow-lg shadow-signal-500/15 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-400/60"
              >
                Apply as a coach
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-ink-500 leading-tight text-right">
                38% acceptance rate
                <br />
                <span className="text-ink-300 font-semibold">
                  No SaaS fee, ever
                </span>
              </p>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

const ATHLETE_POINTS = [
  {
    icon: Award,
    title: "12,418 verified specialists across 10 sports",
    body: "Yoga, surf, BJJ, climbing, marathon — sports generalists never coach."
  },
  {
    icon: HeartHandshake,
    title: "Free 15-min intro call with every coach",
    body: "Meet the human first. Pay only when you decide to book."
  },
  {
    icon: LineChart,
    title: "One dashboard, every metric",
    body: "HRV, sleep, pace, power — your coach sees what you allow, nothing more."
  }
] as const;

const COACH_POINTS = [
  {
    icon: Wallet,
    title: "85% take-home, paid in 24h via Stripe Connect",
    body: "No subscription fee. No setup fee. We earn when you do."
  },
  {
    icon: Calendar,
    title: "Calendar, chat, video and payments — built in",
    body: "Stop stitching Calendly + Zoom + Notion + invoices together."
  },
  {
    icon: ShieldCheck,
    title: "We bring you athletes already in-market",
    body: "Match-quiz routes warm leads straight into your booking page."
  }
] as const;

function PhotoSlab({
  src,
  alt,
  tag,
  tone
}: {
  src: string;
  alt: string;
  tag: string;
  tone: "brand" | "signal";
}) {
  const tagClass =
    tone === "brand"
      ? "bg-brand-500/15 text-brand-200 ring-brand-500/40"
      : "bg-signal-500/15 text-signal-200 ring-signal-500/40";
  const duotoneClass =
    tone === "brand" ? "fc-photo-duotone" : "fc-photo-duotone fc-photo-duotone-warm";
  return (
    <div
      className={`relative aspect-[16/9] overflow-hidden ${duotoneClass} fc-photo-mask`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute top-4 left-4 z-10">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 backdrop-blur ${tagClass}`}
        >
          <span className="fc-badge-flicker h-1.5 w-1.5 rounded-full" />
          {tag}
        </span>
      </div>
    </div>
  );
}
