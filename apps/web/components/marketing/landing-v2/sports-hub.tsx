"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { SPORT_CATEGORIES, STRAVA_SPORT_TYPES } from "@/lib/sports/strava-sports";
import { SectionHeader } from "@/components/ui-glass/premium-system";

function hashCount(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h + label.charCodeAt(i) * 17) % 997;
  return 100 + (h % 900);
}

export function SportsHub() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      gsap.from(".sports-hub-card", {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.04,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%"
        }
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="sports-hub"
      className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-24"
    >
      <SectionHeader
        eyebrow="Sports hub"
        title={
          <>
            Every sport. <span className="gradient-text">One platform.</span>
          </>
        }
        body={`${STRAVA_SPORT_TYPES.length}+ Strava activity types — filter stats, coaches and routes by what you actually train.`}
      />

      <div className="mt-10 space-y-8">
        {SPORT_CATEGORIES.map((cat) => (
          <div key={cat.id}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-200">
              <span aria-hidden>{cat.emoji}</span>
              <span className="capitalize">{cat.labelKey.replace("_", " ")}</span>
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {cat.sports.map((sport) => (
                <article
                  key={sport}
                  className="sports-hub-card snap-start shrink-0 w-[140px] rounded-2xl border border-ink-800 bg-ink-950/70 p-4 transition hover:border-volt-500/30 hover:shadow-volt-glow"
                >
                  <p className="font-display text-sm font-bold text-ink-50">{sport}</p>
                  <p className="mt-2 text-[10px] text-ink-500">activities logged</p>
                  <p className="mt-1 font-mono text-xs text-volt-400">
                    {hashCount(sport)} today
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
