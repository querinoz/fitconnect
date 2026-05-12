"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Activity, MapPin } from "lucide-react";

/**
 * Real-people training reel.
 *
 * Two stacked marquees that scroll in opposite directions, giving the
 * section motion-on-scroll without paying a JS scroll cost. Each photo
 * carries a sport+city caption so the user sees a concrete training
 * scene, not a stock thumbnail.
 *
 * Photo sources:
 *  - The base `images.unsplash.com` IDs already vetted in `lib/data.ts`
 *    (so we don't reintroduce hostnames the team hasn't approved).
 *  - `picsum.photos?seed=...` as a stable fallback for "scene" photos
 *    where the exact subject doesn't matter.
 */
const REEL_TOP: ReelItem[] = [
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=720&q=80&auto=format&fit=crop",
    sport: "Strength",
    city: "Madrid",
    coach: "Tomás R."
  },
  {
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=720&q=80&auto=format&fit=crop",
    sport: "Yoga",
    city: "Lisbon",
    coach: "Marina C."
  },
  {
    src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=720&q=80&auto=format&fit=crop",
    sport: "Surf",
    city: "Ericeira",
    coach: "Hana O."
  },
  {
    src: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=720&q=80&auto=format&fit=crop",
    sport: "Climbing",
    city: "Innsbruck",
    coach: "Lior B."
  },
  {
    src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=720&q=80&auto=format&fit=crop",
    sport: "Martial arts",
    city: "Tokyo",
    coach: "Aiko T."
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=720&q=80&auto=format&fit=crop",
    sport: "CrossFit",
    city: "Berlin",
    coach: "Matt K."
  }
];

const REEL_BOTTOM: ReelItem[] = [
  {
    src: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=720&q=80&auto=format&fit=crop",
    sport: "Running",
    city: "Porto",
    coach: "Diego A."
  },
  {
    src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=720&q=80&auto=format&fit=crop",
    sport: "Cycling",
    city: "Girona",
    coach: "Mateo R."
  },
  {
    src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=720&q=80&auto=format&fit=crop",
    sport: "Swimming",
    city: "Nice",
    coach: "Sophie L."
  },
  {
    src: "https://images.unsplash.com/photo-1517438476312-10d79c5f25c9?w=720&q=80&auto=format&fit=crop",
    sport: "Boxing",
    city: "London",
    coach: "Ade O."
  },
  {
    src: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=720&q=80&auto=format&fit=crop",
    sport: "Marathon",
    city: "Berlin",
    coach: "Niamh G."
  },
  {
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=720&q=80&auto=format&fit=crop",
    sport: "Powerlifting",
    city: "Stockholm",
    coach: "Astrid V."
  }
];

type ReelItem = { src: string; sport: string; city: string; coach: string };

export function PhotoReel() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on the section as it enters the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const xRow1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, -60]);
  const xRow2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-40, 40]);

  return (
    <section
      ref={containerRef}
      aria-labelledby="fc-reel-title"
      className="relative isolate py-16 md:py-20 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5">
              <Activity aria-hidden="true" className="h-3.5 w-3.5" /> Live this week
            </p>
            <h2
              id="fc-reel-title"
              className="mt-3 font-display text-3xl md:text-4xl font-bold text-balance leading-tight"
            >
              Real athletes. Real coaches.{" "}
              <span className="gradient-text">Real sweat.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink-400">
            A snapshot of sessions logged across FitConnect right now —
            yoga in Lisbon, climbing in Innsbruck, marathon prep in Berlin.
          </p>
        </div>
      </div>

      {/* Top row — drifts right→left, with parallax x */}
      <motion.div
        style={{ x: xRow1 }}
        className="mask-fade-x relative"
      >
        <div className="fc-photo-marquee flex gap-5 w-max">
          {[...REEL_TOP, ...REEL_TOP].map((p, i) => (
            <PhotoCard key={`top-${i}`} item={p} variant="tall" />
          ))}
        </div>
      </motion.div>

      {/* Bottom row — drifts left→right, slightly faster, lower contrast */}
      <motion.div
        style={{ x: xRow2 }}
        className="mask-fade-x relative mt-5"
      >
        <div
          className="fc-photo-marquee fc-photo-marquee-fast flex gap-5 w-max"
          style={{ animationDirection: "reverse" }}
        >
          {[...REEL_BOTTOM, ...REEL_BOTTOM].map((p, i) => (
            <PhotoCard key={`bot-${i}`} item={p} variant="wide" />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function PhotoCard({
  item,
  variant
}: {
  item: ReelItem;
  variant: "tall" | "wide";
}) {
  const dims =
    variant === "tall"
      ? "w-[260px] h-[180px] sm:w-[320px] sm:h-[210px]"
      : "w-[300px] h-[170px] sm:w-[360px] sm:h-[200px]";
  return (
    <figure
      className={`group relative shrink-0 overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900 fc-photo-mask fc-photo-duotone ${dims}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={`${item.sport} session in ${item.city}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <figcaption className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3 text-ink-50">
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold leading-tight truncate">
            {item.sport}
          </p>
          <p className="text-[11px] text-ink-300 inline-flex items-center gap-1 mt-0.5">
            <MapPin aria-hidden="true" className="h-3 w-3 text-brand-300" />
            {item.city} · with {item.coach}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 backdrop-blur px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-300 ring-1 ring-accent-500/40">
          <span className="fc-badge-flicker h-1.5 w-1.5 rounded-full" />
          Live
        </span>
      </figcaption>
    </figure>
  );
}
