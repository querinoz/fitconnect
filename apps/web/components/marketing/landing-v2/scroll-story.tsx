"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
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

  const copy = {
    athletes: { title: s.athletesTitle, body: s.athletesBody, cta: s.athletesCta },
    coaches: { title: s.coachesTitle, body: s.coachesBody, cta: s.coachesCta },
    together: { title: s.togetherTitle, body: s.togetherBody, cta: s.togetherCta }
  };

  useGSAP(
    () => {
      registerGsapPlugins();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const panels = gsap.utils.toArray<HTMLElement>(".scroll-story-panel");
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;
        gsap.to(panel, {
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            pin: true,
            pinSpacing: false,
            scrub: 0.8,
            end: "+=120%"
          }
        });

        gsap.from(panel.querySelector(".scroll-story-card"), {
          scrollTrigger: {
            trigger: panel,
            start: "top 70%",
            toggleActions: "play none none reverse"
          },
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out"
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} id="scroll-story" className="relative bg-ink-950">
      <div className="mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6">
        <p className="nivis-micro-label nivis-micro-label--accent mb-3">{s.eyebrow}</p>
        <h2 className="nivis-headline max-w-3xl lowercase">
          {s.title}{" "}
          <span className="text-volt-500">{s.titleAccent}</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm lowercase text-ink-400">{s.subtitle}</p>
      </div>

      {PANELS.map((panel, index) => {
        const c = copy[panel.key];
        return (
          <div
            key={panel.key}
            className="scroll-story-panel relative flex min-h-[100dvh] items-end overflow-hidden"
          >
            <Image src={panel.image} alt="" fill className="object-cover opacity-55" sizes="100vw" priority={index === 0} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />

            <div className="relative z-10 mx-auto w-full max-w-7xl fc-section-x px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6">
              <div
                className="scroll-story-card nivis-menu-card !aspect-auto min-h-[280px] max-w-md p-6 sm:p-8"
                style={{ backgroundColor: panel.tone }}
              >
                <p className="nivis-micro-label mb-4 text-ink-300">
                  {String(index + 1).padStart(2, "0")} · {s.chapter}
                </p>
                <h3 className="hero-title font-display text-[clamp(2rem,8vw,4rem)] font-medium lowercase text-ink-50">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm lowercase leading-relaxed text-ink-300">{c.body}</p>
                <Link
                  href={panel.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-volt-500 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-950 transition hover:bg-volt-400"
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
          <p className="nivis-micro-label">{s.footerHint}</p>
          <Link href="/signup" className="text-sm font-semibold lowercase text-volt-500 hover:text-volt-400">
            {s.footerCta} →
          </Link>
        </NivisPanel>
      </div>
    </section>
  );
}
