import Link from "next/link";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { Atmosphere } from "./atmosphere";
import { dict } from "@/lib/i18n";

const AVATAR_COLORS = [
  "from-volt-400 to-volt-600",
  "from-brand-400 to-brand-600",
  "from-brand-400 to-brand-700",
  "from-emerald-500 to-brand-600",
  "from-signal-400 to-signal-600"
];

/** Server-rendered hero copy — h1 is first paint for LCP. */
export function HeroStatic() {
  const h = dict.en.hero;

  return (
    <section
      className="relative isolate overflow-x-clip pt-12 pb-12 md:pt-20 md:pb-16 lg:pb-28"
      aria-labelledby="fc-hero-title"
    >
      <Atmosphere particles={10} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl lg:max-w-none lg:col-span-6 fc-hero-enter">
          <p className="eyebrow mb-4">FitConnect · Kinetic Energy Lab</p>
          <h1
            id="fc-hero-title"
            className="fc-vt-hero font-display text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-[0.92]"
          >
            <span className="fc-headline-line">{h.title1}</span>
            <span className="fc-headline-line">
              <span className="gradient-text">{h.titleAccent}</span>
            </span>
            <span className="fc-headline-line">{h.title2}</span>
          </h1>

          <div className="mt-6 fc-vt-wordmark hidden sm:block">
            <BrandLockup logoSize={44} textSize={20} tagline layout="stack" />
          </div>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-volt-dim px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-volt-500 ring-1 ring-volt-500/25">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-volt-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-volt-500" />
            </span>
            {h.livePill}
          </span>

          <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl text-balance">
            {h.subtitle}
          </p>

          <p className="mt-4 text-sm font-medium text-brand-400/90 max-w-2xl">
            {h.reassurance}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-volt-500 px-6 py-3 text-sm font-bold text-ink-950 shadow-volt-glow hover:bg-volt-400 fc-motion-micro"
            >
              {h.primary} <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="#see-it-in-action"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border-sm)] bg-carbon-1/80 px-6 py-3 text-sm font-semibold text-ink-100 hover:border-volt-500/35 fc-motion-micro"
            >
              {h.secondary}
            </Link>
            <Link
              href="/mobile"
              className="inline-flex items-center justify-center rounded-xl border border-brand-400/35 bg-connect-dim px-6 py-3 text-sm font-semibold text-brand-400 hover:border-brand-400/55 fc-motion-micro"
            >
              {h.demoCta}
            </Link>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-5 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2" aria-hidden="true">
                {AVATAR_COLORS.map((gradient, i) => (
                  <span
                    key={i}
                    className={`h-9 w-9 rounded-full ring-2 ring-ink-950 bg-gradient-to-br ${gradient}`}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} aria-hidden className="h-3.5 w-3.5 fill-current" />
                  ))}
                  <span className="ml-2 text-ink-100 font-semibold text-sm tabular-nums">
                    4.94
                  </span>
                </div>
                <p className="text-xs text-ink-400">{h.reviewsLine}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-volt-dim text-volt-500 ring-1 ring-volt-500/25">
                <ShieldCheck aria-hidden className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-ink-100">{h.rejectedTitle}</p>
                <p className="text-xs text-ink-400">{h.rejectedBody}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
