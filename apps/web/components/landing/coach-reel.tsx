"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { COACH_REEL } from "@/lib/landing/coach-reel-data";
import { cn } from "@/lib/utils";

export function CoachReel() {
  const copy = useLocale().landingEditorial.coachReel;
  const scrollerRef = useRef<HTMLDivElement>(null);

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
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.5;
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

  return (
    <section
      className="relative overflow-x-clip bg-eos-floor py-10 sm:py-14"
      aria-labelledby="coach-reel-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p id="coach-reel-heading" className="sr-only">
          {copy.dragHint}
        </p>
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-eos-on-surface-muted">
          {copy.dragHint}
        </p>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "flex cursor-grab gap-4 overflow-x-auto px-4 pb-2 sm:gap-5 sm:px-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory"
        )}
      >
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
      </div>
    </section>
  );
}
