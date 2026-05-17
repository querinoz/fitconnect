"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { Atmosphere } from "./atmosphere";
import { ProductMockup } from "./product-mockup";
import { useT } from "@/lib/i18n-provider";

/**
 * Immersive landing hero.
 *
 * Composition:
 *  - <Atmosphere /> — kinetic energy lines + radial bands behind everything.
 *  - Wordmark — entrance via the "fc-word" word-stagger keyframes.
 *  - H1 — "view-transition-name: fc-hero-title" lets the title cross-fade
 *    smoothly to /discover, /pricing and /dashboard.
 *  - <ProductMockup /> — animated dashboard miniature as artwork.
 */
export function HeroImmersive() {
  const t = useT();
  const reduce = useReducedMotion();
  const fadeUp = reduce ? false : { opacity: 0, y: 8 };
  const fadeUpLg = reduce ? false : { opacity: 0, y: 24 };

  return (
    <section
      className="relative isolate overflow-hidden pt-12 pb-24 md:pt-20 md:pb-28"
      aria-labelledby="fc-hero-title"
    >
      <Atmosphere particles={22} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <motion.span
            initial={fadeUp}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 ring-1 ring-brand-500/30"
          >
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
            </span>
            {t("hero", "livePill")}
          </motion.span>

          {/* Wordmark — sits above the headline, bigger than nav. */}
          <div className="mt-7 fc-vt-wordmark">
            <Wordmark size={42} className="drop-shadow-[0_0_30px_rgba(34,211,238,0.18)]" />
          </div>

          {/* Word-stagger headline. */}
          <h1
            id="fc-hero-title"
            className="fc-vt-hero mt-5 font-display text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[0.95]"
          >
            <span className="fc-headline-line">
              {t("hero", "title1")}
            </span>
            <span className="fc-headline-line">
              <span className="gradient-text">{t("hero", "titleAccent")}</span>
            </span>
            <span className="fc-headline-line">{t("hero", "title2")}</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-ink-300 max-w-2xl text-balance">
            {t("hero", "subtitle")}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/discover">
                {t("hero", "primary")}{" "}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#see-it-in-action">{t("hero", "secondary")}</Link>
            </Button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-5 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2" aria-hidden="true">
                {[47, 12, 32, 14, 49].map((id) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={id}
                    src={`https://i.pravatar.cc/64?img=${id}`}
                    alt=""
                    className="h-9 w-9 rounded-full ring-2 ring-ink-950"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className="h-3.5 w-3.5 fill-current"
                    />
                  ))}
                  <span className="ml-2 text-ink-100 font-semibold text-sm tabular-nums">
                    4.94
                  </span>
                </div>
                <p className="text-xs text-ink-400">
                  {t("hero", "reviewsLine")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/10 text-accent-500 ring-1 ring-accent-500/30">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-ink-100">
                  {t("hero", "rejectedTitle")}
                </p>
                <p className="text-xs text-ink-400">
                  {t("hero", "rejectedBody")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product mockup + floating real-people photo cluster */}
        <motion.div
          initial={fadeUpLg}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.2 }}
          className="lg:col-span-6 relative"
        >
          <ProductMockup />

          {/* Floating coach photo — top-left of the mockup. Real face from
              hour-one signals "this is a marketplace of real people". */}
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&q=80&auto=format&fit=crop"
            alt="Strength coach in the gym"
            sport="Strength"
            coachAvatar="https://i.pravatar.cc/80?img=12"
            position="top-left"
            anim="fc-photo-float-a"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=320&q=80&auto=format&fit=crop"
            alt="Yoga coach in a studio"
            sport="Yoga"
            coachAvatar="https://i.pravatar.cc/80?img=47"
            position="bottom-right"
            anim="fc-photo-float-b"
          />
          <FloatingCoachPhoto
            src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=320&q=80&auto=format&fit=crop"
            alt="Running coach on a coastal trail"
            sport="Running"
            coachAvatar="https://i.pravatar.cc/80?img=23"
            position="middle-right"
            anim="fc-photo-float-c"
          />
        </motion.div>
      </div>
    </section>
  );
}

type FloatingCoachPhotoProps = {
  src: string;
  alt: string;
  sport: string;
  coachAvatar: string;
  position: "top-left" | "bottom-right" | "middle-right";
  anim: "fc-photo-float-a" | "fc-photo-float-b" | "fc-photo-float-c";
};

/**
 * Tiny coach-photo card that floats around the product mockup.
 *
 * Hidden under `md` to avoid crowding the product mockup on phones.
 * Drift is via CSS keyframes (no JS scroll); reduced-motion guard is
 * already wired in globals.css.
 */
function FloatingCoachPhoto({
  src,
  alt,
  sport,
  coachAvatar,
  position,
  anim
}: FloatingCoachPhotoProps) {
  const positionClass =
    position === "top-left"
      ? "-top-6 -left-8 hidden md:block"
      : position === "bottom-right"
        ? "-bottom-8 -right-6 hidden md:block"
        : "top-1/2 -right-10 -translate-y-1/2 hidden xl:block";

  return (
    <figure
      aria-hidden="true"
      className={`absolute ${positionClass} w-36 lg:w-40 ${anim} z-10`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-ink-800 shadow-elevated bg-ink-950 fc-photo-mask">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="eager"
          className="h-28 w-full object-cover"
        />
        <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coachAvatar}
            alt=""
            className="h-6 w-6 rounded-full ring-2 ring-ink-950 object-cover"
          />
          <span className="text-[10px] font-semibold text-ink-50 leading-tight truncate">
            {sport}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-ink-950/70 backdrop-blur px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-accent-300 ring-1 ring-accent-500/40">
            <span className="fc-badge-flicker h-1 w-1 rounded-full" />
            Live
          </span>
        </div>
      </div>
    </figure>
  );
}
