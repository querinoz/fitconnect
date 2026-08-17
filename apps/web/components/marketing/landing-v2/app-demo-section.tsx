"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { EliteMobileCockpit } from "@/components/mobile/elite-mobile-cockpit";
import { useLiveDemoTelemetry } from "@/lib/demo/live-telemetry";
import { useLocale } from "@/lib/i18n-provider";

const roster = [
  { name: "Ines Martins", status: "Green", scoreKey: "readiness" as const },
  { name: "Diego Alvarez", status: "Watching drift", score: "4.2" },
  { name: "Marta Kovac", status: "Threshold day", score: "73" }
];

const timeline = ["Sync", "Read", "Adjust", "Approve"];

export function AppDemoSection() {
  const rootRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const d = locale.dashboardPreview;
  const stage = locale.landingEditorial.productStage;
  const live = useLiveDemoTelemetry();

  useGSAP(
    () => {
      registerGsapPlugins();

      if (shouldReduceMotion()) {
        gsap.set(".preview-reveal", { y: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.from(".preview-reveal", {
          y: 24,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 72%"
          }
        });

        gsap.to(".preview-video", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }, rootRef);

      return () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === rootRef.current) trigger.kill();
        });
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="athlete-os"
      className="landing-v2-section relative isolate overflow-x-clip px-4 py-24 sm:px-6 sm:py-32"
      aria-labelledby="preview-title"
    >
      <div id="demo" className="sr-only" />
      <div className="absolute inset-0 -z-20 bg-[var(--eos-floor)]" />
      <video
        aria-hidden="true"
        className="preview-video absolute inset-0 -z-10 h-[112%] w-full object-cover opacity-[0.18] saturate-[0.65]"
        autoPlay
        muted
        loop
        playsInline
        poster="/brand/fitconnect-logo-1024.png"
      >
        <source src="/hero-training.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_36%,rgba(200,255,0,0.13),transparent_29%),linear-gradient(180deg,rgba(7,11,20,0.98),rgba(7,11,20,0.72)_48%,rgba(7,11,20,0.98))]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:40px_40px] opacity-70"
      />

      <div className="mx-auto grid w-full min-w-0 max-w-[1440px] grid-cols-1 gap-10 xl:grid-cols-2 xl:items-start">
        <div className="preview-reveal min-w-0 xl:pb-12">
          <p className="eos-label-caps text-eos-voltline">{d.eyebrow}</p>
          <h2
            id="preview-title"
            className="mt-4 max-w-full break-words font-display text-[clamp(2rem,7vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tight text-eos-on-surface"
          >
            <span className="block">{stage.titleLine1}</span>
            <span className="block">{stage.titleLine2}</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-eos-on-surface-muted">{stage.subtitle}</p>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 border-t border-white/12 pt-6 sm:grid-cols-4">
            {timeline.map((step, index) => (
              <div key={step} className="preview-reveal min-w-0">
                <span className="font-mono text-xs text-eos-on-surface-subtle">0{index + 1}</span>
                <p className="mt-2 eos-label-caps text-eos-on-surface">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-reveal relative flex min-w-0 w-full flex-col items-center gap-8">
          <EliteMobileCockpit embedded />
          <div className="w-full min-w-0 rounded-[1.75rem] border border-white/10 bg-[rgba(7,11,20,0.56)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="eos-label-caps text-eos-voltline">{stage.coach}</p>
            <p className="mt-2 font-display text-2xl text-eos-on-surface">{stage.roster}</p>
            <div className="mt-4 divide-y divide-white/10">
              {roster.map((row) => (
                <div key={row.name} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-eos-on-surface">{row.name}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-eos-on-surface-subtle">
                      {row.status}
                    </p>
                  </div>
                  <span className="font-mono text-lg tabular-nums text-eos-voltline">
                    {"scoreKey" in row ? live.readiness : row.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
