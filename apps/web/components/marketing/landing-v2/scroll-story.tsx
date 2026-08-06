"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, registerGsapPremium } from "@/lib/motion/gsap-register";
import type { GsapPremiumPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";
import { NivisPanel } from "@/components/ui-glass/nivis-panel";

const PANELS = [
  {
    key: "athletes" as const,
    href: "/dashboard?demo=athlete",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80",
    tone: "#1a2433"
  },
  {
    key: "coaches" as const,
    href: "/coach/dashboard?demo=coach",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80",
    tone: "#241a14"
  },
  {
    key: "together" as const,
    href: "/community",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80",
    tone: "#142418"
  }
] as const;

export function ScrollStory() {
  const { landingV2 } = useLocale();
  const s = landingV2.scrollStory;
  const rootRef = useRef<HTMLElement>(null);

  const plugins = useRef<GsapPremiumPlugins | null>(null);
  const [pluginsReady, setPluginsReady] = useState(false);

  useEffect(() => {
    if (plugins.current) return;
    registerGsapPremium()
      .then((p) => { plugins.current = p; setPluginsReady(true); })
      .catch(() => {});
  }, []);

  const copy = {
    athletes: { title: s.athletesTitle, body: s.athletesBody, cta: s.athletesCta },
    coaches: { title: s.coachesTitle, body: s.coachesBody, cta: s.coachesCta },
    together: { title: s.togetherTitle, body: s.togetherBody, cta: s.togetherCta }
  };

  // Pin + card reveal + parallax bg
  useGSAP(
    () => {
      registerGsapPlugins();
      if (shouldReduceMotion()) return;

      const panels = gsap.utils.toArray<HTMLElement>(".scroll-story-panel");
      panels.forEach((panel, i) => {
        const isLast = i === panels.length - 1;

        if (!isLast) {
          // Pin each panel while the next scrolls over it
          gsap.to(panel, {
            scrollTrigger: {
              trigger: panel,
              start: "top top",
              pin: true,
              pinSpacing: false,
              scrub: 0.8,
              end: "+=120%",
              invalidateOnRefresh: true
            }
          });
        }

        // Card entrance
        gsap.from(panel.querySelector(".scroll-story-card"), {
          scrollTrigger: {
            trigger: panel,
            start: "top 70%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true
          },
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out"
        });

        // Parallax bg — image wrapper moves at ~30% of scroll speed.
        // The wrapper extends 15% beyond the panel so there's headroom for the shift.
        const imgWrapper = panel.querySelector<HTMLElement>(".scroll-story-img");
        if (imgWrapper) {
          gsap.fromTo(
            imgWrapper,
            { yPercent: -8 },
            {
              yPercent: isLast ? 8 : 12,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });
    },
    { scope: rootRef }
  );

  // SplitText per-word stagger on panel titles — fires after plugins ready
  useGSAP(
    () => {
      if (!pluginsReady || !plugins.current) return;
      if (shouldReduceMotion()) return;

      const { SplitText } = plugins.current;
      const titles = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>(".scroll-story-title") ?? []
      );

      const splits = titles.map((el) => {
        const split = new SplitText(el, { type: "words", wordsClass: "gsap-word" });
        gsap.from(split.words, {
          y: 28,
          opacity: 0,
          duration: 0.65,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
            invalidateOnRefresh: true
          },
          onComplete: () => split.revert()
        });
        return split;
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: rootRef, dependencies: [pluginsReady] }
  );

  return (
    <section ref={rootRef} id="scroll-story" className="relative border-t border-white/5 bg-[var(--eos-floor)]">
      <div className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6">
        <p className="eos-label-caps mb-3 text-eos-voltline">{s.eyebrow}</p>
        <h2 className="eos-display max-w-3xl lowercase">
          {s.title}{" "}
          <span className="text-eos-voltline">{s.titleAccent}</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm lowercase text-eos-on-surface-subtle">{s.subtitle}</p>
      </div>

      {PANELS.map((panel, index) => {
        const c = copy[panel.key];
        return (
          <div
            key={panel.key}
            className="scroll-story-panel relative flex min-h-[100dvh] items-end overflow-hidden"
          >
            {/* Parallax image wrapper — extends beyond panel edges for parallax headroom */}
            <div className="scroll-story-img pointer-events-none absolute inset-x-0 -bottom-[15%] -top-[15%]">
              <Image
                src={panel.image}
                alt=""
                fill
                className="object-cover opacity-55"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--eos-floor)] via-[var(--eos-floor)]/55 to-[var(--eos-floor)]/20" />

            <div className="relative z-10 mx-auto w-full max-w-7xl fc-section-x px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6">
              <div
                className="scroll-story-card eos-bento-card !aspect-auto min-h-[280px] max-w-md border border-white/10 p-6 transition duration-300 hover:border-eos-voltline/30 sm:p-8"
                style={{ backgroundColor: panel.tone }}
              >
                <p className="eos-label-caps mb-4 text-eos-on-surface-subtle">
                  {String(index + 1).padStart(2, "0")} · {s.chapter}
                </p>
                <h3 className="scroll-story-title hero-title font-display text-[clamp(2rem,8vw,4rem)] font-medium lowercase text-eos-on-surface">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm lowercase leading-relaxed text-eos-on-surface-muted">
                  {c.body}
                </p>
                <Link
                  href={panel.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-eos-voltline px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#070b14] transition hover:shadow-[0_0_24px_rgba(200,255,0,0.4)]"
                >
                  {c.cta}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mx-auto max-w-7xl fc-section-x px-4 py-12 sm:px-6">
        <NivisPanel className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="eos-label-caps">{s.footerHint}</p>
          <Link
            href="/signup"
            className="text-sm font-semibold lowercase text-eos-voltline hover:text-volt-400"
          >
            {s.footerCta} →
          </Link>
        </NivisPanel>
      </div>
    </section>
  );
}
