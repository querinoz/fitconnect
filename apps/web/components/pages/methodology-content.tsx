"use client";

import {
  ArrowDown,
  BookOpen,
  FlaskConical,
  Microscope,
  Quote,
  ShieldCheck
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Cta } from "@/components/cta";
import { DemoBanner } from "@/components/demo-banner";
import { formatMsg, useLocale } from "@/lib/i18n-provider";

const pillarNumbers = ["01", "02", "03", "04", "05", "06"];

export function MethodologyContent() {
  const locale = useLocale();
  const mp = locale.methodologyPage;
  const pillars = locale.methodologyPillars;

  return (
    <>
      <DemoBanner />
      <Nav />
      <main id="main">
        <section className="relative overflow-hidden pt-16 pb-20">
          <div className="absolute inset-0 -z-10 gradient-bg opacity-70" />
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> {mp.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl font-bold leading-[0.95] text-balance">
              {mp.title}{" "}
              <span className="gradient-text">{mp.titleAccent}</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl mx-auto leading-relaxed">
              {mp.subtitle}
            </p>
            <a
              href="#pillars"
              className="mt-10 inline-flex items-center gap-2 text-sm text-ink-300 hover:text-ink-100"
            >
              {mp.pillarsTitle} <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>
        </section>

        <section id="pillars" className="mx-auto max-w-7xl px-6 py-20">
          <div className="space-y-20">
            {pillars.map((m, i) => (
              <article
                key={pillarNumbers[i]}
                className="grid lg:grid-cols-12 gap-10 items-start"
              >
                <div className="lg:col-span-4">
                  <div className="sticky top-24">
                    <p className="font-display text-7xl md:text-8xl font-bold gradient-text leading-none">
                      {pillarNumbers[i]}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-widest text-ink-500">
                      {formatMsg(mp.pillarOf, {
                        n: String(i + 1),
                        total: String(pillars.length)
                      })}
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-5">
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                    {m.title}
                  </h2>
                  <p className="text-ink-300 text-lg leading-relaxed">{m.subtitle}</p>
                  <p className="text-ink-400 leading-relaxed">{m.body}</p>
                  <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-ink-500">
                        {m.metricLabel}
                      </p>
                      <p className="mt-1 font-display text-3xl font-bold gradient-text">
                        {m.metricValue}
                      </p>
                    </div>
                    <p className="text-xs text-ink-500 max-w-[180px] text-right">
                      {mp.sourceLabel} {m.citation}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="absolute inset-0 -z-10 gradient-bg-warm opacity-30" />
          <div className="max-w-3xl">
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Microscope className="h-3.5 w-3.5" /> {mp.evidenceEyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-balance">
              {mp.evidenceTitle}
            </h2>
            <p className="mt-4 text-ink-400 text-lg">{mp.evidenceSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {mp.evidence.map((e) => (
              <article
                key={e.title}
                className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-plasma-500/10 text-plasma-400 ring-1 ring-plasma-500/30">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg leading-snug">
                      {e.title}
                    </h3>
                    <p className="text-xs text-ink-500">{e.citation}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-300 leading-relaxed">{e.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-10">
            <div className="flex items-start gap-4">
              <Quote className="h-8 w-8 text-brand-400 shrink-0" />
              <div>
                <p className="font-display text-2xl md:text-3xl font-bold leading-snug">
                  &ldquo;{mp.quote}&rdquo;
                </p>
                <p className="mt-5 text-sm text-ink-400">— {mp.quoteAuthor}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border border-ink-800 bg-ink-900/40 p-10 grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: mp.stats.interviewed, value: "32,184" },
              { label: mp.stats.accepted, value: "12,418" },
              { label: mp.stats.acceptanceRate, value: "38.6%" }
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-5xl font-bold gradient-text">{s.value}</p>
                <p className="mt-2 text-sm text-ink-400">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
            {mp.auditNote}
          </p>
        </section>

        <Cta />
      </main>
      <Footer />
    </>
  );
}
