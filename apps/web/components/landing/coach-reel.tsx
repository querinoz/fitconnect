"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLocale } from "@/lib/i18n-provider";
import { COACH_REEL } from "@/lib/landing/coach-reel-data";
import { cn } from "@/lib/utils";

export function CoachReel() {
  const copy = useLocale().landingEditorial.coachReel;
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

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

  return (
    <section className="bg-ink-950/80 py-6 backdrop-blur-sm sm:py-10" aria-labelledby="coach-reel-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p id="coach-reel-heading" className="sr-only">
          {copy.dragHint}
        </p>
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-ink-400">
          {copy.dragHint}
        </p>
      </div>
      <div
        ref={scrollerRef}
        className={cn(
          "flex cursor-grab gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "snap-x snap-mandatory"
        )}
      >
        {COACH_REEL.map((coach) => (
          <Link
            key={coach.id}
            href={`/trainer/${coach.id}`}
            className="group relative block h-[380px] w-[280px] shrink-0 snap-start overflow-hidden rounded-sm transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            <Image
              src={coach.image}
              alt=""
              fill
              sizes="280px"
              className="object-cover object-top"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent"
            />
            <span className="absolute left-3 top-3 rounded-sm bg-volt-500/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-950">
              {copy.verified}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-volt-500">
                {coach.city} · {coach.specialty}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink-50">{coach.name}</p>
              <p className="mt-1 text-[11px] text-ink-300/80">
                ★★★★★ {coach.rating.toFixed(2)} ({coach.sessions} {copy.sessions})
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
