"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Discover trainers, read reviews, save favourites — forever free.",
    features: [
      "Unlimited browsing",
      "Save 10 favourites",
      "Read 27,000+ reviews",
      "Coach finder quiz"
    ]
  },
  {
    name: "Athlete",
    price: "12",
    highlight: true,
    desc: "Everything you need for serious, measurable progress.",
    features: [
      "Unlimited bookings",
      "Free 15-min intro with every coach",
      "Full athlete dashboard (HRV, sleep, AI)",
      "Programs library access",
      "Priority support · response < 2h"
    ]
  },
  {
    name: "Coach",
    price: "29",
    desc: "Run your coaching business from a single app — keep 85% of every booking.",
    features: [
      "Up to 50 active clients",
      "Plan builder + 600+ exercise library",
      "Stripe Connect payouts",
      "Marketing tools + featured listings",
      "Trainer dashboard + analytics"
    ]
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow">Pricing</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
          Honest, low-floor pricing. <br />
          <span className="gradient-text">No surprise fees</span>.
        </h2>
        <p className="mt-4 text-ink-400 text-lg">
          €12/mo is a sixteenth of what Future or Caliber charge — because you only pay your
          coach when you book a session.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              p.highlight
                ? "border-brand-400/60 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent shadow-glow"
                : "border-ink-800 bg-ink-900/40"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-400 text-ink-950 px-3 py-0.5 text-xs font-bold">
                <Sparkles className="h-3 w-3" /> Most popular
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
            <p className="text-ink-400 mt-1 text-sm min-h-[40px]">{p.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold font-display gradient-text">
                €{p.price}
              </span>
              <span className="text-ink-400">/month</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-200">
                  <div className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-500/15 text-accent-400">
                    <Check className="h-3 w-3" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="mt-8 w-full"
              variant={p.highlight ? "default" : "outline"}
            >
              <Link href="/pricing">
                Start {p.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-brand-300 hover:text-brand-200 font-semibold"
        >
          Compare every feature, fee and FAQ → <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
