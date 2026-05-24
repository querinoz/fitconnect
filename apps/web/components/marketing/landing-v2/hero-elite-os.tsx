"use client";

import Link from "next/link";
import { ArrowRight, Bolt } from "lucide-react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";
import { CornerTicks, CrosshairBg, LabelCaps } from "@/components/elite-os";

/** Elite OS cinematic hero — Stitch reference layout. */
export function HeroEliteOs() {
  const { hero } = useLocale();
  const h = hero.immersive;
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) {
        gsap.set(".hero-eos-reveal", { opacity: 1, y: 0 });
        return;
      }
      gsap.from(".hero-eos-reveal", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });
      gsap.to(".hero-eos-float", {
        y: -12,
        duration: 4,
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
      className="relative min-h-[900px] overflow-hidden eos-floor pt-28 pb-32"
      aria-label="FitConnect Elite OS"
    >
      <CrosshairBg className="pointer-events-none absolute inset-0" showGlow />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-full bg-eos-iris/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[800px] w-[800px] rounded-full bg-eos-voltline/5 blur-[150px]" />
      </div>

      <header className="hero-eos-reveal sticky top-0 z-50 border-b border-white/5 bg-[var(--eos-floor)]/60 backdrop-blur-2xl">
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
            className="hidden items-center rounded-full bg-eos-voltline px-6 py-2.5 eos-label-caps text-[#070b14] transition hover:shadow-[0_0_24px_rgba(200,255,0,0.4)] md:inline-flex"
          >
            INITIALIZE
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-16 px-6 md:px-8 lg:grid-cols-12">
        <div className="hero-eos-reveal flex flex-col gap-8 lg:col-span-6">
          <div className="flex items-center gap-3 eos-label-caps tracking-[0.2em] text-eos-on-surface-muted">
            <span className="h-1.5 w-1.5 rounded-sm bg-eos-voltline" />
            {h.statusLabel}{" "}
            <span className="text-eos-voltline">{h.statusValue}</span>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[0.9] tracking-tighter text-eos-on-surface">
            {h.headlineLine1}
            <br />
            <span className="bg-gradient-to-r from-eos-voltline to-eos-iris bg-clip-text text-transparent">
              {h.headlineAccent}
            </span>
            <br />
            {h.headlineLine2}
            <br />
            {h.headlineLine3}
          </h1>
          <p className="max-w-xl text-lg font-light leading-relaxed text-eos-on-surface-muted">
            {h.subtitle}
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-eos-voltline px-8 py-4 eos-label-caps text-[#070b14] transition hover:shadow-[0_0_24px_rgba(200,255,0,0.4)]"
            >
              {h.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-4 eos-label-caps text-eos-on-surface transition hover:border-white/30 hover:bg-white/5"
            >
              {h.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="hero-eos-reveal relative mt-8 h-[560px] lg:col-span-6 lg:mt-0 lg:h-[700px]">
          <div className="absolute inset-4 overflow-hidden rounded-3xl border border-white/5 eos-glass shadow-2xl">
            <CornerTicks />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[var(--eos-floor)] via-transparent to-transparent" />
            <img
              alt=""
              className="h-full w-full object-cover opacity-60 mix-blend-luminosity"
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80"
            />
          </div>

          <div className="hero-eos-float absolute left-0 top-1/4 z-20 w-72 -translate-x-4 rounded-2xl border border-white/10 eos-glass p-6 shadow-2xl md:-left-12">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">READINESS_INDEX</LabelCaps>
              <Bolt className="h-4 w-4 text-eos-voltline" aria-hidden />
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-6xl leading-none text-eos-on-surface">98</span>
              <span className="font-mono text-eos-voltline">%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-eos-surface-container-highest">
              <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-eos-iris to-eos-voltline eos-volt-glow" />
            </div>
          </div>

          <div className="hero-eos-float absolute bottom-16 right-0 z-20 w-80 translate-x-4 rounded-2xl border border-white/10 eos-glass p-6 shadow-2xl md:-right-12">
            <CornerTicks />
            <div className="mb-4 flex items-start justify-between">
              <LabelCaps className="opacity-60">HRV_BASELINE</LabelCaps>
              <span className="rounded border border-eos-iris/30 bg-eos-iris/10 px-2 py-0.5 font-mono text-[9px] text-eos-iris-soft">
                OPTIMAL
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-display text-5xl leading-none text-eos-on-surface">112</span>
              <span className="font-mono text-sm text-eos-on-surface-muted">ms</span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-1">
              {[30, 60, 90, 50, 70, 20, 45, 35].map((height, i) => (
                <div
                  key={i}
                  className="w-full rounded-t-sm bg-eos-iris/40"
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
