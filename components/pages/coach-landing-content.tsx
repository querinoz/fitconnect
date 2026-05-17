"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  HeartHandshake,
  Users,
  Video,
  Wallet,
  CreditCard,
  Globe2,
  ClipboardList,
  BadgeCheck
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/demo-banner";
import { formatMsg, useLocale } from "@/lib/i18n-provider";

const perkIcons = [Wallet, Video, CreditCard, Globe2, ClipboardList, BadgeCheck];

const earningsCohort = [
  { months: "0-3", median: 980, top10: 2640 },
  { months: "3-6", median: 2110, top10: 4180 },
  { months: "6-12", median: 3420, top10: 6210 },
  { months: "12+", median: 4880, top10: 9740 }
];

const voiceAvatars = [
  "https://i.pravatar.cc/200?img=47",
  "https://i.pravatar.cc/200?img=12",
  "https://i.pravatar.cc/200?img=23"
];

export function CoachLandingContent() {
  const locale = useLocale();
  const cl = locale.coachLanding;

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <section className="relative overflow-hidden pt-12 pb-16">
          <div className="absolute inset-0 -z-10 gradient-bg" />
          <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5" /> {cl.eyebrow}
              </p>
              <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
                {cl.title}
                <br />
                <span className="gradient-text">{cl.titleAccent}</span>
              </h1>
              <p className="mt-5 text-ink-300 text-lg max-w-xl">{cl.subtitle}</p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <Button asChild size="lg">
                  <Link href="/dashboard?as=trainer">
                    {cl.applyCta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#earnings">{cl.seeEarnings}</Link>
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <Stat label={cl.stats.activeCoaches} value="12,418" />
                <Stat label={cl.stats.avgTakeHome} value="85%" />
                <Stat label={cl.stats.coachNps} value="71" />
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1100&auto=format&fit=crop"
                alt=""
                className="rounded-3xl ring-1 ring-ink-800 shadow-elevated"
              />
              <div className="absolute -bottom-4 -left-4 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/15 text-accent-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-ink-100 font-semibold">{cl.floatingMedian}</p>
                  <p className="text-[11px] text-ink-400">{cl.floatingMedianSub}</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="text-ink-100 font-semibold">{cl.floatingAthletes}</p>
                  <p className="text-[11px] text-ink-400">{cl.floatingAthletesSub}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="perks" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cl.perks.map((p, i) => {
              const Icon = perkIcons[i] ?? Wallet;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 hover:border-brand-400/40 transition-colors"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-lg">{p.title}</h3>
                  <p className="mt-2 text-sm text-ink-400 leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="earnings" className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="eyebrow">{cl.earningsTitle}</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-balance">
                {cl.earningsTitle}{" "}
                <span className="gradient-text">{cl.earningsTitleAccent}</span>
              </h2>
              <p className="mt-4 text-ink-400 text-lg">{cl.earningsSubtitle}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink-300">
                {cl.earningsBullets.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent-400 mt-0.5 shrink-0" /> {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-8">
              <div className="space-y-5">
                {earningsCohort.map((row) => {
                  const max = 10000;
                  return (
                    <div key={row.months}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <p className="text-sm font-medium text-ink-100">
                          {formatMsg(cl.cohortMonths, { range: row.months })}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {cl.median} €
                          {new Intl.NumberFormat().format(row.median)} · {cl.top10} €
                          {new Intl.NumberFormat().format(row.top10)}
                        </p>
                      </div>
                      <div className="relative h-7 rounded-full bg-ink-800/50 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                          style={{ width: `${(row.median / max) * 100}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-full border border-brand-300/40"
                          style={{ width: `${(row.top10 / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 text-xs text-ink-500">{cl.earningsSource}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-2xl font-bold">{cl.voicesTitle}</h2>
            <p className="mt-2 text-ink-400">{cl.voicesSubtitle}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {cl.voices.map((c, i) => (
              <div
                key={c.name}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={voiceAvatars[i] ?? voiceAvatars[0]}
                    alt={c.name}
                    className="h-10 w-10 rounded-full ring-2 ring-ink-950"
                  />
                  <div>
                    <p className="font-semibold text-ink-100">{c.name}</p>
                    <p className="text-xs text-ink-500">{c.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-ink-200 leading-relaxed text-sm">
                  &ldquo;{c.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">{cl.onboardingEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">
              {cl.onboardingTitle}{" "}
              <span className="gradient-text">{cl.onboardingTitleAccent}</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {cl.onboardingSteps.map((s) => (
              <div
                key={s.detail}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-7"
              >
                <span className="font-display text-5xl font-bold gradient-text">
                  {s.detail}
                </span>
                <h3 className="mt-3 font-display font-semibold text-xl">{s.title}</h3>
                <p className="mt-2 text-ink-400">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold gradient-text">{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}
