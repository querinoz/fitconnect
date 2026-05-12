"use client";

import { Check } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Discover trainers, read reviews, save favourites.",
    features: ["Unlimited browsing", "Save 10 favourites", "Email support"]
  },
  {
    name: "Athlete",
    price: "12",
    highlight: true,
    desc: "Everything you need for serious progress.",
    features: [
      "Unlimited bookings",
      "Live video room",
      "Progress dashboard",
      "Priority support"
    ]
  },
  {
    name: "Coach",
    price: "29",
    desc: "Run your business inside one app.",
    features: [
      "Up to 50 active clients",
      "Plan builder + library",
      "Stripe Connect payouts",
      "Marketing tools"
    ]
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-brand-400 uppercase tracking-widest">
          Pricing
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
          Simple plans for everyone.
        </h2>
        <p className="mt-3 text-ink-400">
          No setup fees, cancel any time. All prices in EUR per month, taxes excluded.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl border p-8 ${
              p.highlight
                ? "border-brand-400/60 bg-gradient-to-b from-brand-500/10 to-transparent"
                : "border-ink-800 bg-ink-900/40"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-brand-400 text-ink-950 px-3 py-0.5 text-xs font-bold">
                Most popular
              </span>
            )}
            <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
            <p className="text-ink-400 mt-1">{p.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-5xl font-bold font-display">€{p.price}</span>
              <span className="text-ink-400">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-ink-200">
                  <Check className="h-4 w-4 text-accent-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full" variant={p.highlight ? "default" : "outline"}>
              <Link href="/discover">Start {p.name}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
