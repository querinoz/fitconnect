"use client";

import Link from "next/link";
import { Activity, ArrowRight, Play, Radio, ShieldCheck } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { CornerTicks, CrosshairBg, LabelCaps } from "@/components/elite-os";

const proofStats = [
  { value: "12,418", label: "verified coaches" },
  { value: "4.94", label: "athlete rating" },
  { value: "62%", label: "coach applicants rejected" }
];

const telemetry = [
  { label: "HRV", value: "71 ms", tone: "text-eos-telemetry" },
  { label: "Load", value: "0.84", tone: "text-eos-voltline" },
  { label: "Sleep", value: "7h 18m", tone: "text-eos-performance" }
];

export function HeroEliteOs() {
  const { hero } = useLocale();
  const h = hero.immersive;
  const rootRef = useRef<HTMLElement>(null);
  const { gateDone } = useLandingGate();

  const plugins = useRef<GsapPremiumPlugins | null>(null);
  const [pluginsReady, setPluginsReady] = useState(false);

  useEffect(() => {
    if (plugins.current) return;
    registerGsapPremium()
      .then((p) => { plugins.current = p; setPluginsReady(true); })
      .catch(() => {});
  }, []);

  // Block-level fade+rise for all hero elements except the headline.
  // The headline is held at opacity:0 until SplitText char stagger fires.
  useGSAP(
    () => {
      registerGsapPlugins();

      if (shouldReduceMotion()) {
        gsap.set(".hero-eos-reveal", { opacity: 1, y: 0 });
        gsap.set(".hero-eos-meter", { scaleX: 1 });
        gsap.set(".hero-eos-headline", { opacity: 1 });
        return;
      }

      // Hold headline invisible — SplitText takes over.
      gsap.set(".hero-eos-headline", { opacity: 0 });

      gsap.from(".hero-eos-reveal", {
        y: 32,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2
      });

      gsap.from(".hero-eos-meter", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.1,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.55
      });

      gsap.to(".hero-eos-float", {
        y: -10,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.5, from: "random" }
      });
    },
    { scope: rootRef }
  );

  // Clip-path character stagger — fires after gate dissolves + premium plugins load.
  useGSAP(
    () => {
      if (!gateDone || !pluginsReady || !plugins.current) return;
      if (shouldReduceMotion()) {
        gsap.set(".hero-eos-headline", { opacity: 1 });
        return;
      }

      const { SplitText } = plugins.current;
      const h1 = rootRef.current?.querySelector<HTMLElement>(".hero-eos-headline");
      if (!h1) return;

      // Unhide the element before splitting.
      gsap.set(h1, { opacity: 1 });

      const split = new SplitText(h1, {
        type: "chars,words",
        charsClass: "gsap-char",
        wordsClass: "gsap-word"
      });

      gsap.from(split.chars, {
        clipPath: "inset(0 110% 0 0)",
        y: 10,
        duration: 0.55,
        stagger: { amount: 0.55, from: "start" },
        ease: "power3.out",
        onComplete: () => split.revert()
      });
    },
    { scope: rootRef, dependencies: [gateDone, pluginsReady] }
  );

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100dvh] overflow-hidden eos-floor pb-16 pt-20 sm:pb-20 sm:pt-24"
      aria-label="FitConnect Elite OS"
    >
      <CrosshairBg className="pointer-events-none absolute inset-0" showGlow />

      <div className="absolute inset-0">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_38%,rgba(200,255,0,0.16),transparent_28%),linear-gradient(90deg,rgba(7,11,20,0.98)_0%,rgba(7,11,20,0.84)_36%,rgba(7,11,20,0.46)_64%,rgba(7,11,20,0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--eos-floor)] to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[7vw] top-[18vh] h-[34rem] w-[34rem] rounded-full bg-eos-telemetry/10 blur-[140px]" />
        <div className="absolute bottom-[10vh] right-[6vw] h-[28rem] w-[28rem] rounded-full bg-eos-voltline/10 blur-[120px]" />
      </div>

      <header className="hero-eos-reveal relative z-30 mx-auto mb-10 w-[min(calc(100%-2rem),1440px)] rounded-full border border-white/10 bg-[var(--eos-floor)]/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-8">
          <span className="font-display text-2xl font-bold tracking-tighter text-eos-on-surface">
            FIT<span className="text-eos-voltline">CONNECT</span>
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#demo" className="eos-label-caps flex items-center gap-2 text-eos-voltline">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-eos-voltline" />
              OS OVERVIEW
            </Link>
            <Link href="#demo" className="eos-label-caps text-eos-on-surface-muted transition hover:text-eos-on-surface">
              TELEMETRY
            </Link>
            <Link href="#manifesto" className="eos-label-caps text-eos-on-surface-muted transition hover:text-eos-on-surface">
              MANIFESTO
            </Link>
          </nav>
          <Link
            href="/signup"
            className="hidden min-h-11 items-center rounded-full bg-eos-voltline px-6 py-2.5 eos-label-caps text-[#070b14] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eos-voltline active:translate-y-px md:inline-flex"
          >
            INITIALIZE
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-12">
        <div className="hero-eos-reveal flex min-w-0 flex-col gap-8 pb-4 lg:pb-12">
          <div className="flex items-center gap-3 eos-label-caps tracking-[0.2em] text-eos-on-surface-muted">
            <span className="h-1.5 w-1.5 rounded-sm bg-eos-voltline" />
            {h.statusLabel} <span className="text-eos-voltline">{h.statusValue}</span>
          </div>

          <h1 className="hero-eos-headline max-w-[9ch] font-display text-[clamp(3rem,13vw,7.2rem)] font-extrabold uppercase leading-[0.82] tracking-tight text-eos-on-surface">
            <span className="block">Train on</span>
            <span className="block">live data.</span>
          </h1>

          <p className="max-w-2xl text-lg font-light leading-relaxed text-eos-on-surface-muted sm:text-xl">
            FitConnect pairs verified specialist coaches with live readiness, wearable telemetry, and session feedback so every training decision has a signal behind it.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-eos-voltline px-8 py-4 eos-label-caps text-[#070b14] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eos-voltline active:translate-y-px"
            >
              Find my coach
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#demo"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 eos-label-caps text-eos-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 active:translate-y-px"
            >
              <Play className="h-4 w-4" aria-hidden />
              Watch the OS
            </Link>
          </div>

          <dl className="grid max-w-2xl grid-cols-1 gap-3 pt-6 sm:grid-cols-3">
            {proofStats.map((stat) => (
              <div key={stat.label} className="border-t border-white/12 pt-4">
                <dt className="eos-label-caps text-eos-on-surface-subtle">{stat.label}</dt>
                <dd className="mt-2 font-mono text-2xl text-eos-on-surface">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-eos-reveal relative min-h-[520px] lg:min-h-[690px]">
          <div className="absolute inset-x-0 bottom-0 top-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(7,11,20,0.42)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_34px_120px_-62px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:inset-x-4">
            <CornerTicks />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_50%_18%,rgba(60,215,255,0.14),transparent_32%)]" />

            <div className="absolute inset-x-8 top-8 flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <LabelCaps>Live session</LabelCaps>
                <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-eos-on-surface">
                  Threshold recalibration
                </p>
              </div>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-eos-voltline/25 bg-eos-voltline/10 px-4 font-mono text-xs uppercase tracking-[0.16em] text-eos-voltline">
                <Radio className="h-4 w-4" aria-hidden />
                Live
              </span>
            </div>

            <div className="absolute inset-x-8 top-36 space-y-5">
              {telemetry.map((item, index) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-eos-on-surface-muted">
                    <span>{item.label}</span>
                    <span className={item.tone}>{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="hero-eos-meter h-full rounded-full bg-gradient-to-r from-eos-telemetry via-eos-performance to-eos-voltline"
                      style={{ width: `${72 + index * 8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-8 left-8 w-56 rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.06)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:w-60">
              <div className="mb-4 flex items-center justify-between">
                <LabelCaps>Coach action</LabelCaps>
                <ShieldCheck className="h-5 w-5 text-eos-performance" aria-hidden />
              </div>
              <p className="text-sm leading-6 text-eos-on-surface-muted">
                Diego cut the final interval after HR drift crossed baseline.
              </p>
            </div>
          </div>

          <div className="hero-eos-float absolute left-0 top-[4.5rem] z-20 w-[min(18rem,82vw)] rounded-2xl border border-white/10 eos-glass p-5 shadow-2xl sm:w-72 lg:-left-56">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">READINESS_INDEX</LabelCaps>
              <Activity className="h-4 w-4 text-eos-voltline" aria-hidden />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-6xl leading-none text-eos-on-surface">86</span>
              <span className="font-mono text-eos-voltline">%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-eos-surface-container-highest">
              <div className="hero-eos-meter h-full w-[86%] rounded-full bg-gradient-to-r from-eos-telemetry to-eos-voltline" />
            </div>
          </div>

          <div className="hero-eos-float absolute bottom-14 right-0 z-20 w-[min(16rem,84vw)] rounded-2xl border border-white/10 eos-glass p-5 shadow-2xl sm:w-64 lg:translate-x-2">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">COACH_SIGNAL</LabelCaps>
              <span className="rounded border border-eos-telemetry/30 bg-eos-telemetry/10 px-2 py-0.5 font-mono text-[9px] text-eos-telemetry">
                ADJUSTED
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-5xl leading-none text-eos-on-surface">4.2</span>
              <span className="font-mono text-sm text-eos-on-surface-muted">% load drop</span>
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
          </div>
        </div>
      </div>
    </section>
  );
}
