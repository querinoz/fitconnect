"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { ComparisonTable } from "@/components/comparison-table";
import { Faqs } from "@/components/faqs";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "monthly" | "annual";

const plans = [
  {
    name: "Free",
    monthly: 0,
    annual: 0,
    desc: "Discover trainers, read 27,000+ reviews, save favourites.",
    cta: "Start free",
    features: [
      "Unlimited browsing",
      "Save 10 favourites",
      "Coach finder quiz",
      "Read every review on the platform",
      "Email support"
    ]
  },
  {
    name: "Athlete",
    monthly: 12,
    annual: 9,
    highlight: true,
    desc: "Everything you need for serious progress. Pay per session on top.",
    cta: "Start Athlete",
    features: [
      "Unlimited bookings",
      "Free 15-min intro with every coach",
      "Full athlete dashboard (HRV, sleep, AI workout)",
      "Programs library + lifetime updates",
      "Priority support · &lt; 2h response",
      "Recovery-aware booking",
      "Community & clubs access"
    ]
  },
  {
    name: "Team",
    monthly: 29,
    annual: 24,
    desc: "Built for households, run clubs, training partners.",
    cta: "Start Team",
    features: [
      "Up to 5 athlete profiles",
      "Shared training calendar",
      "Group sessions discount (-15%)",
      "Family-friendly billing",
      "Everything in Athlete"
    ]
  },
  {
    name: "Coach",
    monthly: 29,
    annual: 24,
    coach: true,
    desc: "Run your coaching business from one app. Keep 85%.",
    cta: "Apply as coach",
    features: [
      "Up to 50 active clients",
      "Plan builder + 600+ exercise library",
      "Stripe Connect payouts",
      "Marketing tools + featured listings",
      "Trainer analytics + retention dashboard",
      "Group sessions & cohort coaching",
      "Custom branded coach page"
    ]
  }
];

const reassurance = [
  {
    icon: ShieldCheck,
    title: "Free 15-min intro",
    body: "Every coach. Every time. Switch coaches whenever you want — your athlete profile travels with you."
  },
  {
    icon: HeartPulse,
    title: "No 12-month contracts",
    body: "Pause any time, no questions asked. We don't think anyone should pay for a service they're not using."
  },
  {
    icon: Wallet,
    title: "Honest take-home",
    body: "Coaches keep 85% of every booking — the highest take-home on any marketplace. We post our P&L."
  }
];

const sessionPriceExamples = [
  { sport: "Yoga", from: 35, mid: 60, top: 110 },
  { sport: "Strength", from: 40, mid: 70, top: 130 },
  { sport: "Surf", from: 50, mid: 80, top: 160 },
  { sport: "Climbing", from: 45, mid: 70, top: 140 },
  { sport: "Running", from: 30, mid: 55, top: 100 },
  { sport: "Cycling", from: 35, mid: 65, top: 120 }
];

const pricingFaqs = [
  {
    q: "Why is the platform fee so low compared to Future or Caliber?",
    a: "Future and Caliber bundle a coach into their flat monthly price ($199-$200). FitConnect charges a small platform fee (€12/mo) and lets you choose any coach at their hourly rate. You only pay for the sessions you actually book — typical athletes pay 30-60% less than Future for equivalent coaching hours."
  },
  {
    q: "Do you take a cut from coaches?",
    a: "Yes — a 15% platform fee. Coaches keep 85% of every booking, which is the highest take-home on any marketplace (ClassPass pays studios 30-50%; Mindbody pays nothing because it's SaaS). We publish a quarterly P&L on the methodology page."
  },
  {
    q: "What happens if my coach cancels?",
    a: "Full refund + 25% credit on your next booking. Our Coach Match team will re-pair you within 48 hours. Repeat offenders are removed from the platform."
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Your subscription pauses immediately and you keep access until the end of the current billing cycle. No retention emails, no friction."
  }
];

export default function PricingPage() {
  const [period, setPeriod] = useState<Period>("annual");
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pt-16 pb-12">
          <div className="absolute inset-0 -z-10 gradient-bg" />
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Pricing
            </p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
              Honest pricing for{" "}
              <span className="gradient-text">honest training</span>.
            </h1>
            <p className="mt-6 text-lg text-ink-300 max-w-2xl mx-auto">
              €12/mo for the platform. Your coach&apos;s rate is whatever they set. No hidden
              session fees. No 12-month contracts. Pause whenever your life needs it.
            </p>

            <div className="mt-8 inline-flex items-center rounded-full border border-ink-800 bg-ink-900/60 p-1">
              <button
                onClick={() => setPeriod("monthly")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                  period === "monthly"
                    ? "bg-ink-100 text-ink-950"
                    : "text-ink-300 hover:text-ink-100"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod("annual")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-2",
                  period === "annual"
                    ? "bg-ink-100 text-ink-950"
                    : "text-ink-300 hover:text-ink-100"
                )}
              >
                Annual
                <span className="rounded-full bg-accent-500/20 text-accent-300 px-1.5 py-0.5 text-[10px] font-bold">
                  −25%
                </span>
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {plans.map((p) => {
              const price = period === "monthly" ? p.monthly : p.annual;
              return (
                <div
                  key={p.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl border p-7",
                    p.highlight
                      ? "border-brand-400/60 bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent shadow-glow"
                      : "border-ink-800 bg-ink-900/40"
                  )}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand-400 text-ink-950 px-3 py-0.5 text-xs font-bold">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </span>
                  )}
                  {p.coach && (
                    <span className="absolute -top-3 left-6 rounded-full bg-plasma-500 text-ink-50 px-3 py-0.5 text-xs font-bold">
                      For coaches
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-ink-400 min-h-[44px]">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-display gradient-text">
                      €{price}
                    </span>
                    <span className="text-ink-400 text-sm">/month</span>
                  </div>
                  {period === "annual" && p.monthly > 0 && (
                    <p className="text-[11px] text-ink-500">
                      billed €{price * 12} / year
                    </p>
                  )}
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-ink-200"
                      >
                        <div className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-500/15 text-accent-400 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span dangerouslySetInnerHTML={{ __html: f }} />
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-6 w-full"
                    variant={p.highlight ? "default" : "outline"}
                  >
                    <Link href="/discover">
                      {p.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reassurance.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-ink-800 bg-ink-900/30 p-5 flex gap-3"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/10 text-brand-300 shrink-0">
                  <r.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink-100 text-sm">{r.title}</p>
                  <p className="mt-1 text-sm text-ink-400 leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-8 md:p-10">
            <div className="flex items-baseline justify-between flex-wrap gap-3">
              <div>
                <p className="eyebrow">Per-session rates</p>
                <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold">
                  What your coach actually costs
                </h2>
              </div>
              <p className="text-xs text-ink-500">
                Median rates across 12,418 coaches · Apr 2026
              </p>
            </div>
            <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sessionPriceExamples.map((row) => (
                <div
                  key={row.sport}
                  className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5"
                >
                  <p className="font-display font-semibold text-lg">{row.sport}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Tier label="Starter" value={`€${row.from}`} />
                    <Tier label="Median" value={`€${row.mid}`} highlight />
                    <Tier label="Elite" value={`€${row.top}`} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-ink-500">
              Trainers set their own rate. Most offer multi-session packs and intro discounts.
              All prices in EUR per 60-min session.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-3xl border border-accent-500/30 bg-accent-500/5 p-8 md:p-10 grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="eyebrow text-accent-400">Price comparison</p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold">
                Real cost for 4 coaching sessions / month
              </h2>
              <p className="mt-3 text-ink-300">
                Apples-to-apples math against the players you&apos;ve heard of.
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-xl bg-ink-950/60 px-4 py-3">
                <span className="text-ink-300">Future (1 coach included)</span>
                <span className="font-display font-bold text-ink-100">$199/mo</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-ink-950/60 px-4 py-3">
                <span className="text-ink-300">Caliber (1 coach included)</span>
                <span className="font-display font-bold text-ink-100">$200/mo</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-500/15 to-accent-500/15 ring-1 ring-brand-400/50 px-4 py-3">
                <span className="text-ink-100 font-medium">FitConnect (median €55/h × 4 + €9 platform)</span>
                <span className="font-display font-bold gradient-text">€229/mo</span>
              </li>
            </ul>
          </div>
          <p className="mt-3 text-center text-xs text-ink-500">
            For two or fewer sessions / month — typical for most athletes — FitConnect is 40-60%
            cheaper while giving you a real specialist.
          </p>
        </section>

        <ComparisonTable />

        <section className="mx-auto max-w-4xl px-6 py-24">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center">
            Pricing FAQs
          </h2>
          <div className="mt-8 space-y-3">
            {pricingFaqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-ink-800 bg-ink-900/40 p-5 open:bg-ink-900/70 open:border-brand-400/40"
              >
                <summary className="cursor-pointer flex items-center justify-between gap-4 list-none">
                  <h3 className="font-semibold text-ink-100">{f.q}</h3>
                  <span className="text-ink-400 group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-ink-400 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <Faqs />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

function Tier({
  label,
  value,
  highlight
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-2.5",
        highlight ? "bg-brand-500/10 ring-1 ring-brand-500/30" : "bg-ink-900/40"
      )}
    >
      <p className="text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-display font-bold text-lg tabular-nums",
          highlight && "gradient-text"
        )}
      >
        {value}
      </p>
    </div>
  );
}
