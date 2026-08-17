"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";
import { LandingCinematicBg } from "@/components/landing/landing-cinematic-bg";
import { LandingPhoneStage, type LandingPhoneRole } from "@/components/landing/landing-phone-stage";
import { EliteButton } from "@/components/elite-os";
import { cn } from "@/lib/utils";

const PANELS: {
  key: LandingPhoneRole;
  href: string;
  copyKey: "athletes" | "coaches" | "together";
}[] = [
  { key: "athlete", copyKey: "athletes", href: "/dashboard?demo=athlete" },
  { key: "coach", copyKey: "coaches", href: "/coach/dashboard?demo=coach" },
  { key: "together", copyKey: "together", href: "/community" }
];

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
      if (shouldReduceMotion()) return;

      const panels = gsap.utils.toArray<HTMLElement>(".scroll-story-panel");
      panels.forEach((panel) => {
        const rig = panel.querySelector<HTMLElement>(".eos-phone-rig");
        const card = panel.querySelector<HTMLElement>(".scroll-story-card");
        if (rig) {
          gsap.fromTo(
            rig,
            { y: 28, rotateY: 8, rotateX: 8 },
            {
              y: 0,
              rotateY: -18,
              rotateX: 8,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 82%",
                end: "top 28%",
                scrub: 0.7,
                invalidateOnRefresh: true
              }
            }
          );
        }
        if (card) {
          gsap.fromTo(
            card,
            { y: 20 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "top 86%",
                end: "top 40%",
                scrub: 0.6,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} id="scroll-story" className="relative overflow-x-clip border-t border-white/5 bg-[var(--eos-floor)]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
        <p className="eos-label-caps mb-3 text-eos-voltline">{s.eyebrow}</p>
        <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold lowercase leading-[0.92] tracking-tight text-eos-on-surface">
          {s.title}{" "}
          <span className="text-eos-voltline">{s.titleAccent}</span>
        </h2>
        <p className="mt-4 max-w-xl text-sm lowercase text-eos-on-surface-subtle">{s.subtitle}</p>
      </div>

      {PANELS.map((panel, index) => {
        const c = copy[panel.copyKey];
        return (
          <article
            key={panel.key}
            className="scroll-story-panel relative min-h-[100dvh] scroll-mt-28 overflow-x-clip"
          >
            <LandingCinematicBg variant={panel.key} />
            <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 px-4 pb-16 pt-36 sm:px-8 xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] xl:gap-12">
              <div
                className={cn(
                  "scroll-story-card min-w-0 max-w-lg rounded-[1.5rem] border border-white/10 bg-[color-mix(in_srgb,var(--eos-floor)_72%,transparent)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-8"
                )}
              >
                <p className="eos-label-caps mb-4 text-eos-on-surface-subtle">
                  {String(index + 1).padStart(2, "0")} · {s.chapter}
                </p>
                <h3 className="font-display text-[clamp(2rem,6vw,3.6rem)] font-extrabold lowercase leading-[0.92] tracking-tight text-eos-on-surface">
                  {c.title}
                </h3>
                <p className="mt-4 max-w-sm text-base lowercase leading-relaxed text-eos-on-surface-muted">
                  {c.body}
                </p>
                <EliteButton asChild size="sm" className="mt-8 rounded-full">
                  <Link href={panel.href}>
                    {c.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </EliteButton>
              </div>

              <div className="flex min-w-0 justify-center xl:justify-center">
                <LandingPhoneStage role={panel.key} />
              </div>
            </div>
          </article>
        );
      })}

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 px-5 py-4">
          <p className="eos-label-caps text-eos-on-surface-muted">{s.footerHint}</p>
          <Link
            href="/signup"
            className="text-sm font-semibold lowercase text-eos-voltline hover:text-eos-on-surface"
          >
            {s.footerCta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
