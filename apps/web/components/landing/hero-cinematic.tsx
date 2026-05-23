"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { useLocale } from "@/lib/i18n-provider";
import { HERO_IMAGE } from "@/lib/landing/coach-reel-data";
import { StatsCorner } from "@/components/landing/stats-corner";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { cn } from "@/lib/utils";

export function HeroCinematic() {
  const locale = useLocale();
  const immersive = locale.hero.immersive;
  const hero = locale.landingEditorial.hero;
  const { gateDone } = useLandingGate();
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!gateDone) return;
      registerGsapPlugins();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline({ delay: 0.15 });
      tl.from(".hero-line", {
        y: 100,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out"
      })
        .from(
          ".hero-stat",
          { opacity: 0, y: 24, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.35"
        )
        .from(".hero-scroll", { opacity: 0, y: -10, duration: 0.5 }, "-=0.2");

      gsap.to(".hero-kenburns", {
        scale: 1.12,
        duration: 18,
        ease: "none",
        repeat: -1,
        yoyo: true
      });

      gsap.to(".hero-kenburns", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    },
    { scope: rootRef, dependencies: [gateDone] }
  );

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100dvh] overflow-hidden bg-ink-950"
      aria-label="FitConnect hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="hero-kenburns absolute inset-0 will-change-transform">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/50 to-ink-950/90"
        />
        <div aria-hidden className="fc-landing-aurora absolute inset-0 opacity-40 mix-blend-soft-light" />
        <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.14] mix-blend-soft-light pulse-soft" />
      </div>

      <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
        <span className="rounded-full border border-white/10 bg-ink-950/50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-100 backdrop-blur-md">
          {hero.badge}
        </span>
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-4 pb-16 pt-28 sm:px-8 sm:pb-20 md:px-12">
        <div className="max-w-5xl">
          <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-ink-50">
            <span className="hero-line block text-[clamp(2.25rem,11vw,8.75rem)]">
              {immersive.connect}
            </span>
            <span className="hero-line block text-[clamp(2.25rem,11vw,8.75rem)] text-volt-500">
              {immersive.train}
            </span>
            <span className="hero-line block text-[clamp(2.25rem,11vw,8.75rem)]">
              {immersive.perform}
            </span>
          </h1>
        </div>
      </div>

      <StatsCorner
        value={hero.statAthletes}
        label={hero.statAthletesLabel}
        className="absolute right-4 top-24 sm:right-8 md:top-28"
      />
      <StatsCorner
        value={hero.statCoaches}
        label={hero.statCoachesLabel}
        className="absolute bottom-28 left-4 sm:left-8"
      />
      <StatsCorner
        value={hero.statRating}
        label={hero.statRatingLabel}
        className="absolute bottom-20 right-4 sm:right-8"
      />

      <p className="hero-scroll absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-volt-500 motion-safe:animate-bounce">
        {hero.scroll}
      </p>

      <div className="absolute bottom-6 right-4 z-20 hidden sm:flex sm:gap-3">
        <Link
          href="/discover"
          className="rounded-full bg-volt-500 px-5 py-2 text-xs font-semibold text-ink-950 hover:bg-volt-400"
        >
          {immersive.ctaPrimary}
        </Link>
        <Link
          href="/dashboard?demo=athlete"
          className={cn(
            "rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-ink-50",
            "backdrop-blur hover:border-volt-500/40"
          )}
        >
          {immersive.ctaSecondary}
        </Link>
      </div>
    </section>
  );
}
