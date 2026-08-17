"use client";

import Link from "next/link";
import { Activity, ArrowRight, Play, Radio, ShieldCheck } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";
import { useLiveDemoTelemetry } from "@/lib/demo/live-telemetry";
import { CornerTicks, CrosshairBg, EliteButton, LabelCaps } from "@/components/elite-os";

export function HeroEliteOs() {
  const e = useLocale().landingEditorial.heroElite;
  const live = useLiveDemoTelemetry();
  const rootRef = useRef<HTMLElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const telemetry = [
    { key: "hrv" as const, value: `${live.hrvMs} ms`, tone: "text-eos-telemetry" },
    { key: "load" as const, value: live.load.toFixed(2), tone: "text-eos-voltline" },
    { key: "sleep" as const, value: "7h 18m", tone: "text-eos-performance" }
  ];

  useEffect(() => {
    if (shouldReduceMotion()) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    const lowMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!saveData && !(lowMemory !== undefined && lowMemory < 4) && !mobile) {
      setShowVideo(true);
    }
  }, []);

  // Copy stays CSS-visible. Motion only enhances meters / float — never hides headlines.
  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) {
        gsap.set(".hero-eos-meter", { scaleX: 1 });
        return;
      }

      gsap.fromTo(
        ".hero-eos-meter",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 1.1,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.2
        }
      );

      gsap.to(".hero-eos-float", {
        y: -8,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.5, from: "random" }
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100dvh] overflow-x-clip eos-floor pb-16 pt-28 sm:pb-20 sm:pt-32"
      aria-label="FitConnect Elite OS"
    >
      <CrosshairBg className="pointer-events-none absolute inset-0" showGlow />

      <div className="absolute inset-0">
        {showVideo ? (
          <video
            aria-hidden="true"
            className="nivis-hero-kenburns h-full w-full object-cover opacity-50 saturate-[0.72]"
            autoPlay
            muted
            loop
            playsInline
            poster="/brand/fitconnect-logo-1024.png"
          >
            <source src="/hero-training.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            aria-hidden
            className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,rgba(200,255,0,0.08),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(60,215,255,0.06),transparent_35%),linear-gradient(180deg,var(--eos-floor),color-mix(in_srgb,var(--eos-floor)_80%,var(--eos-telemetry)))] "
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_38%,rgba(200,255,0,0.16),transparent_28%),linear-gradient(90deg,color-mix(in_srgb,var(--eos-floor)_98%,transparent)_0%,color-mix(in_srgb,var(--eos-floor)_84%,transparent)_36%,color-mix(in_srgb,var(--eos-floor)_46%,transparent)_64%,color-mix(in_srgb,var(--eos-floor)_92%,transparent)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--eos-floor)] to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[7vw] top-[18vh] h-[34rem] w-[34rem] rounded-full bg-eos-telemetry/10 blur-[140px]" />
        <div className="absolute bottom-[10vh] right-[6vw] h-[28rem] w-[28rem] rounded-full bg-eos-voltline/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,32rem)] xl:gap-16">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3 eos-label-caps tracking-[0.2em] text-eos-on-surface-muted">
            <span className="h-1.5 w-1.5 rounded-sm bg-eos-voltline" />
            {e.osLabel}
            <span className="rounded-full border border-eos-voltline/30 px-3 py-1 font-mono text-[10px] text-eos-voltline">
              {e.demoBadge}
            </span>
          </div>

          <h1 className="max-w-full font-display text-[clamp(2.1rem,5.4vw,3.4rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-eos-on-surface">
            <span className="block">{e.headlineLine1}</span>
            <span className="block">{e.headlineLine2}</span>
          </h1>

          <p className="max-w-2xl text-lg font-light leading-relaxed text-eos-on-surface-muted sm:text-xl">
            {e.subtitle}
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <EliteButton asChild size="lg" className="rounded-full">
              <Link href="/signup">
                {e.ctaPrimary}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </EliteButton>
            <EliteButton asChild variant="secondary" size="lg" className="rounded-full">
              <Link href="#athlete-os">
                <Play className="h-4 w-4" aria-hidden />
                {e.ctaSecondary}
              </Link>
            </EliteButton>
          </div>

          <dl className="grid max-w-2xl grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
            {[
              { value: e.statCoaches, label: e.statCoachesLabel },
              { value: e.statRating, label: e.statRatingLabel },
              { value: e.statRejected, label: e.statRejectedLabel }
            ].map((stat) => (
              <div key={stat.label} className="border-t border-white/12 pt-4">
                <dt className="eos-label-caps text-eos-on-surface-subtle">{stat.label}</dt>
                <dd className="mt-2 font-mono text-2xl text-eos-on-surface">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="hero-eos-float rounded-2xl border border-white/10 eos-glass p-5 shadow-2xl">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">{e.readinessIndex}</LabelCaps>
              <Activity className="h-4 w-4 text-eos-voltline" aria-hidden />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-6xl leading-none tabular-nums text-eos-on-surface">
                {live.readiness}
              </span>
              <span className="font-mono text-eos-voltline">%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-eos-surface-container-highest">
              <div
                className="hero-eos-meter h-full rounded-full bg-gradient-to-r from-eos-telemetry to-eos-voltline"
                style={{ width: `${live.readiness}%` }}
              />
            </div>
          </article>

          <article className="hero-eos-float rounded-2xl border border-white/10 eos-glass p-5 shadow-2xl">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">{e.coachSignal}</LabelCaps>
              <span className="rounded border border-eos-telemetry/30 bg-eos-telemetry/10 px-2 py-0.5 font-mono text-[9px] text-eos-telemetry">
                {e.coachSignalBadge}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-5xl leading-none text-eos-on-surface">{e.coachSignalValue}</span>
              <span className="font-mono text-sm text-eos-on-surface-muted">{e.coachSignalUnit}</span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-1">
              {[34, 68, 82, 58, 73, 42, 51, 47].map((height, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-sm bg-eos-telemetry/45"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[color-mix(in_srgb,var(--eos-floor)_58%,transparent)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_34px_120px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:col-span-2">
            <CornerTicks />
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <LabelCaps>{e.liveSession}</LabelCaps>
                <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-eos-on-surface">
                  {e.liveSessionTitle}
                </p>
              </div>
              <span className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-eos-voltline/25 bg-eos-voltline/10 px-4 font-mono text-xs uppercase tracking-[0.16em] text-eos-voltline">
                <Radio className="h-4 w-4" aria-hidden />
                {e.liveBadge}
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {telemetry.map((item, index) => {
                const label =
                  item.key === "hrv"
                    ? e.telemetryHrv
                    : item.key === "load"
                      ? e.telemetryLoad
                      : e.telemetrySleep;
                return (
                  <div key={item.key}>
                    <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-eos-on-surface-muted">
                      <span>{label}</span>
                      <span className={`tabular-nums ${item.tone}`}>{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="hero-eos-meter h-full rounded-full bg-gradient-to-r from-eos-telemetry via-eos-performance to-eos-voltline"
                        style={{ width: `${72 + index * 8}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 max-w-sm rounded-[1.25rem] border border-white/10 bg-white/6 p-4">
              <div className="mb-3 flex items-center justify-between">
                <LabelCaps>{e.coachAction}</LabelCaps>
                <ShieldCheck className="h-5 w-5 text-eos-performance" aria-hidden />
              </div>
              <p className="text-sm leading-6 text-eos-on-surface-muted">{e.coachActionBody}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
