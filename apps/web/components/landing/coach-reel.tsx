"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { useLocale } from "@/lib/i18n-provider";
import { useLandingGate } from "@/components/landing/landing-gate-context";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { COACH_REEL } from "@/lib/landing/coach-reel-data";
import { cn } from "@/lib/utils";

export function CoachReel() {
  const copy = useLocale().landingEditorial.coachReel;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { gateDone } = useLandingGate();

  const plugins = useRef<GsapPremiumPlugins | null>(null);
  const [pluginsReady, setPluginsReady] = useState(false);

  useEffect(() => {
    if (plugins.current) return;
    registerGsapPremium()
      .then((p) => {
        plugins.current = p;
        setPluginsReady(true);
      })
      .catch(() => {});
  }, []);

  // Desktop: pin section and scrub horizontal track with vertical scroll.
  useGSAP(
    () => {
      if (!gateDone || !pluginsReady) return;
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const tween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 48),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${track.scrollWidth}`,
            invalidateOnRefresh: true,
            anticipatePin: 1
          }
        });
        return () => tween.scrollTrigger?.kill();
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [gateDone, pluginsReady] }
  );

  // Mobile / reduced: native drag scroll on horizontal scroller.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (shouldReduceMotion()) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };
    const onUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseup", onUp);
    el.addEventListener("mouseleave", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseup", onUp);
      el.removeEventListener("mouseleave", onUp);
    };
  }, []);

  const cards = (
    <>
      {COACH_REEL.map((coach) => (
        <Link
          key={coach.id}
          href={`/trainer/${coach.id}`}
          className="coach-reel-card group relative block h-[380px] w-[280px] shrink-0 snap-start overflow-hidden rounded-[var(--eos-radius-card)] border border-white/10 transition-transform duration-300 ease-out hover:-translate-y-1 hover:border-eos-voltline/35"
        >
          <Image
            src={coach.image}
            alt=""
            fill
            sizes="280px"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-eos-floor via-eos-floor/40 to-transparent"
          />
          <span className="absolute left-3 top-3 rounded-full border border-eos-voltline/30 bg-eos-voltline/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-eos-floor">
            {copy.verified}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-eos-voltline">
              {coach.city} · {coach.specialty}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-eos-on-surface">
              {coach.name}
            </p>
            <p className="mt-1 text-[11px] text-eos-on-surface-muted">
              ★★★★★ {coach.rating.toFixed(2)} ({coach.sessions} {copy.sessions})
            </p>
          </div>
        </Link>
      ))}
    </>
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-eos-floor/90 py-6 backdrop-blur-sm sm:py-10"
      aria-labelledby="coach-reel-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p id="coach-reel-heading" className="sr-only">
          {copy.dragHint}
        </p>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-eos-on-surface-muted">
          {copy.dragHint}
        </p>
      </div>

      {/* Desktop pinned track */}
      <div className="hidden overflow-hidden md:block">
        <div ref={trackRef} className="flex w-max gap-5 px-6 will-change-transform">
          {cards}
        </div>
      </div>

      {/* Mobile drag scroller */}
      <div
        ref={scrollerRef}
        className={cn(
          "flex cursor-grab gap-4 overflow-x-auto px-4 pb-4 md:hidden",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory"
        )}
      >
        {cards}
      </div>
    </section>
  );
}
