"use client";

import { ShieldCheck, Star } from "lucide-react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { ScrollHint } from "@/components/marketing/ck/scroll-hint";
import { HeroEmailCaptureClient } from "@/components/marketing/hero-email-capture-client";
import { HeroActionsClient } from "@/components/marketing/hero-actions-client";
import { useLocale } from "@/lib/i18n-provider";

const REVIEW_AVATAR_SRCS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
];

const BRAND_LOGOS = [
  { name: "Strava", src: "/brands/strava.svg" },
  { name: "Whoop", src: "/brands/whoop.svg" },
  { name: "Garmin", src: "/brands/garmin.svg" },
  { name: "Oura", src: "/brands/oura.svg" }
];

/** Hero — follows active locale from language picker. */
export function HeroStatic() {
  const locale = useLocale();
  const h = locale.hero;
  const trust = locale.trustStrip;
  const avatarAlts = [
    h.avatarAthleteAlt,
    h.avatarCoachAlt,
    h.avatarAthleteAlt,
    h.avatarAthleteAlt
  ];

  return (
    <section
      className="relative isolate overflow-x-clip pt-[calc(4.5rem+env(safe-area-inset-top))] pb-10 sm:pb-14 lg:pt-20 lg:pb-16"
      aria-labelledby="fc-hero-title"
    >
      <div className="relative z-10 w-full min-w-0">
        <p className="mb-4 font-mono text-[10px] sm:text-[11px] text-ink-500">
          {h.tagline}
        </p>

        <h1
          id="fc-hero-title"
          className="fc-ck-hero font-display font-extrabold tracking-tight text-balance leading-[0.98]"
        >
          <span className="block text-[clamp(2.25rem,10vw,3.75rem)] text-ink-50">
            {h.title1}
          </span>
          <span className="fc-ck-hero-line mt-1 block text-[clamp(2.25rem,10vw,3.75rem)]">
            <span className="gradient-text">{h.titleAccent}</span>
            <span className="text-volt-500">.</span>
          </span>
          <span className="fc-ck-hero-line mt-3 block text-[clamp(1.25rem,5.5vw,2.75rem)] font-bold text-ink-300 leading-snug sm:mt-4">
            {h.title2.split(".")[0]}
            <span className="text-volt-500">.</span>
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-ink-400 leading-relaxed">
          {h.subtitle}
        </p>

        <div className="mt-5 fc-vt-wordmark max-w-full overflow-hidden">
          <BrandLockup logoSize={36} textSize={16} tagline layout="inline" />
        </div>

        <span className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-volt-dim px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.06em] text-volt-500 ring-1 ring-volt-500/25">
          <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-volt-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-volt-500" />
          </span>
          <span className="min-w-0">{h.livePill}</span>
        </span>

        <p className="mt-4 text-sm font-medium text-brand-400/90 max-w-2xl">
          {h.reassurance}
        </p>

        <HeroActionsClient
          demoLabel={h.demoCta}
          signupLabel={h.signupCta}
          coachLabel={h.coachCta}
          methodologyLabel={h.secondary}
        />

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-400">
          <span className="font-semibold text-amber-400 tabular-nums">{trust.reviews}</span>
          <span aria-hidden="true" className="hidden sm:inline text-ink-700">·</span>
          <span>{trust.rejected}</span>
          <span aria-hidden="true" className="hidden sm:inline text-ink-700">·</span>
          <div className="flex items-center gap-3">
            {BRAND_LOGOS.map((b) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={b.name}
                src={b.src}
                alt={b.name}
                width={72}
                height={18}
                className="h-4 w-auto opacity-60 grayscale hover:opacity-90 hover:grayscale-0 transition-all"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:max-w-xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {REVIEW_AVATAR_SRCS.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={avatarAlts[i] ?? h.avatarAthleteAlt}
                  width={36}
                  height={36}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-ink-950"
                />
              ))}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} aria-hidden className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                ))}
                <span className="ml-1.5 text-ink-100 font-semibold text-sm tabular-nums">
                  4.94
                </span>
              </div>
              <p className="text-xs text-ink-400 truncate">{h.reviewsLine}</p>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3 text-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-volt-dim text-volt-500 ring-1 ring-volt-500/25">
              <ShieldCheck aria-hidden className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-ink-100">{h.rejectedTitle}</p>
              <p className="text-xs text-ink-400">{h.rejectedBody}</p>
            </div>
          </div>
        </div>
      </div>

      <HeroEmailCaptureClient />

      <ScrollHint />
    </section>
  );
}
