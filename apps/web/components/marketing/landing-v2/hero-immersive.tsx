"use client";

import Link from "next/link";
import { useRef, useState, useMemo } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { useLocale, useT } from "@/lib/i18n-provider";
import { CinematicBackground, CinematicMenu, NivisBar } from "@/components/marketing/nivis";
import { cn } from "@/lib/utils";

const MENU_IMAGES = {
  athletes:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
  coaches:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  community:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  pricing:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
} as const;

export function HeroImmersive() {
  const locale = useLocale();
  const t = useT();
  const h = locale.hero.immersive;
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuLinks = useMemo(
    () => [
      { href: "/dashboard?demo=athlete", title: h.menuAthletes, image: MENU_IMAGES.athletes, tone: "#1a2433" },
      { href: "/coach/dashboard?demo=coach", title: h.menuCoaches, image: MENU_IMAGES.coaches, tone: "#241a14" },
      { href: "/community", title: h.menuCommunity, image: MENU_IMAGES.community, tone: "#142418" },
      { href: "/pricing", title: h.menuPricing, image: MENU_IMAGES.pricing, tone: "#181818" }
    ],
    [h.menuAthletes, h.menuCoaches, h.menuCommunity, h.menuPricing]
  );

  const secondaryLinks = useMemo(
    () => [
      { href: "/methodology", label: h.menuMethodology },
      { href: "/discover", label: locale.nav.findCoach },
      { href: "/signin", label: locale.nav.signIn }
    ],
    [h.menuMethodology, locale.nav.findCoach, locale.nav.signIn]
  );

  useGSAP(
    () => {
      registerGsapPlugins();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from(".hero-nivis-panel > *", {
        y: 32,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "expo.out",
        delay: 0.35
      });

      if (bgRef.current) {
        gsap.to(bgRef.current, {
          scale: 1.08,
          duration: 20,
          ease: "none",
          repeat: -1,
          yoyo: true
        });
      }

      gsap.to(".hero-nivis-scroll-hint", {
        y: 6,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    },
    { scope: rootRef }
  );

  return (
    <>
      <section
        ref={rootRef}
        className="relative h-[100dvh] min-h-[640px] w-full overflow-hidden nivis-cinematic-bg"
        aria-label="FitConnect hero"
      >
        <CinematicBackground kenBurnsRef={bgRef} />

        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-16 sm:px-6 lg:px-10">
          <div className="hero-nivis-panel nivis-glass-panel mx-auto w-full max-w-4xl p-5 sm:p-7 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 pb-4">
              <span className="hero-nivis-scroll-hint nivis-micro-label nivis-micro-label--accent inline-flex items-center gap-1.5">
                <ArrowDown className="h-3 w-3" aria-hidden />
                {h.scrollHint}
              </span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />
              <span className="nivis-micro-label">{h.tagline}</span>
              <span className="hidden h-3 w-px bg-white/15 md:block" aria-hidden />
              <span className="nivis-micro-label hidden md:inline">{h.badge}</span>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="nivis-headline max-w-2xl lowercase">
                {h.headline}{" "}
                <span className="inline-flex items-center gap-2">
                  <span className="text-volt-500">{h.immersiveAccent}</span>
                  <Link
                    href="/signup"
                    className="inline-grid h-8 w-8 place-items-center rounded-md bg-volt-500 text-ink-950 transition hover:bg-volt-400"
                    aria-label={h.ctaPrimary}
                  >
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                </span>
              </h1>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <StatPill label={h.statAthletes} />
                <StatPill label={h.statCoaches} />
                <StatPill label={h.statActivities} className="hidden sm:inline-flex" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="fc-liquid-btn inline-flex min-h-11 items-center rounded-full bg-volt-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-950"
              >
                {h.ctaPrimary}
              </Link>
              <Link
                href="/dashboard?demo=athlete"
                className="inline-flex min-h-11 items-center rounded-full border border-white/12 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-100 backdrop-blur transition hover:border-volt-500/35"
              >
                {h.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <NivisBar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        signInLabel={t("nav", "signIn")}
        menuLabel={h.menuLabel}
        secondaryHref="/dashboard?demo=athlete"
        secondaryLabel={h.ctaSecondary}
      />

      <CinematicMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        exploreTitle={h.exploreMenu}
        links={menuLinks}
        secondaryLinks={secondaryLinks}
      />
    </>
  );
}

function StatPill({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur",
        className
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-200">
        {label}
      </span>
    </div>
  );
}
