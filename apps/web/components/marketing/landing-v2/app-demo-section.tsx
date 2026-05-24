"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { useLocale } from "@/lib/i18n-provider";

const vitals = [
  { label: "HRV", value: "71 ms", width: "82%" },
  { label: "Load", value: "0.84", width: "64%" },
  { label: "Sleep", value: "7h 18m", width: "91%" }
];

const roster = [
  { name: "Ines Martins", status: "Green", score: "86" },
  { name: "Diego Alvarez", status: "Watching drift", score: "4.2" },
  { name: "Marta Kovac", status: "Threshold day", score: "73" }
];

const timeline = ["Sync", "Read", "Adjust", "Approve"];

export function AppDemoSection() {
  const rootRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const d = locale.dashboardPreview;

  useGSAP(
    () => {
      registerGsapPlugins();

      if (shouldReduceMotion()) {
        gsap.set(".preview-reveal", { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(".preview-meter", { scaleX: 1 });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.from(".preview-reveal", {
          opacity: 0,
          y: 34,
          clipPath: "inset(16% 0% 0% 0%)",
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 72%"
          }
        });

        gsap.from(".preview-meter", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 62%"
          }
        });

        gsap.to(".preview-float", {
          y: -12,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.35
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
      id="demo"
      className="landing-v2-section relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32"
      aria-labelledby="preview-title"
    >
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

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
        <div className="preview-reveal lg:pb-12">
          <p className="eos-label-caps text-eos-voltline">{d.eyebrow}</p>
          <h2
            id="preview-title"
            className="mt-4 max-w-[10ch] font-display text-[clamp(3rem,8vw,5.9rem)] font-extrabold uppercase leading-[0.84] tracking-tight text-eos-on-surface"
          >
            <span className="block">Same OS.</span>
            <span className="block">Real preview.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-eos-on-surface-muted">
            The preview now uses the same cinematic system as the hero: live readiness,
            coach action, wearable telemetry and a single dark performance surface.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3 border-t border-white/12 pt-6 sm:grid-cols-4">
            {timeline.map((step, index) => (
              <div key={step} className="preview-reveal">
                <span className="font-mono text-xs text-eos-on-surface-subtle">0{index + 1}</span>
                <p className="mt-2 eos-label-caps text-eos-on-surface">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-reveal relative min-h-[760px] lg:min-h-[780px]">
          <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(7,11,20,0.56)] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_40px_140px_-70px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 sm:px-8">
              <span className="font-display text-sm font-bold tracking-tight text-eos-on-surface">
                FIT<span className="text-eos-voltline">CONNECT</span>
              </span>
              <span className="hidden eos-label-caps text-eos-on-surface-subtle sm:inline-flex">Live command</span>
              <span className="rounded-full border border-eos-voltline/30 bg-eos-voltline/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-eos-voltline">
                Online
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 2xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eos-label-caps text-eos-on-surface-subtle">Readiness index</p>
                    <div className="mt-5 flex items-end gap-2">
                      <span className="font-display text-7xl font-bold leading-none text-eos-on-surface">
                        86
                      </span>
                      <span className="pb-2 font-mono text-eos-voltline">%</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-eos-performance/25 bg-eos-performance/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-eos-performance">
                    Primed
                  </span>
                </div>

                <div className="mt-8 space-y-5">
                  {vitals.map((vital) => (
                    <div key={vital.label}>
                      <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em] text-eos-on-surface-muted">
                        <span>{vital.label}</span>
                        <span className="text-eos-on-surface">{vital.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="preview-meter h-full rounded-full bg-gradient-to-r from-eos-telemetry via-eos-performance to-eos-voltline"
                          style={{ width: vital.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="eos-label-caps text-eos-on-surface-subtle">Coach directive</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-eos-on-surface">
                        Reduce final interval by 4.2%
                      </h3>
                    </div>
                    <span className="font-mono text-sm text-eos-voltline">07:18</span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-eos-on-surface-muted">
                    HR drift crossed baseline during warm-up. Diego approved the adjusted
                    block before the athlete reached threshold pace.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="border-t border-white/12 pt-3">
                      <p className="eos-label-caps text-eos-on-surface-subtle">Strain</p>
                      <p className="mt-2 font-mono text-2xl text-eos-on-surface">10.8</p>
                    </div>
                    <div className="border-t border-white/12 pt-3">
                      <p className="eos-label-caps text-eos-on-surface-subtle">Recovery</p>
                      <p className="mt-2 font-mono text-2xl text-eos-on-surface">+6 ms</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-eos-voltline/20 bg-[rgba(200,255,0,0.075)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]">
                  <p className="eos-label-caps text-eos-voltline">Approved update</p>
                  <p className="mt-3 text-sm leading-6 text-eos-on-surface-muted">
                    Thursday threshold moved. The athlete sees the change in-session.
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <p className="eos-label-caps text-eos-on-surface-subtle">Roster pulse</p>
                  <div className="mt-4 divide-y divide-white/10">
                    {roster.map((row) => (
                      <div key={row.name} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-eos-on-surface">{row.name}</p>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-eos-on-surface-subtle">
                            {row.status}
                          </p>
                        </div>
                        <span className="font-mono text-lg text-eos-voltline">{row.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-float absolute left-2 top-0 hidden w-[min(19rem,86vw)] rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.065)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_30px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-2xl 2xl:block 2xl:-left-20">
            <p className="eos-label-caps text-eos-on-surface-subtle">Athlete surface</p>
            <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-full border-[10px] border-eos-voltline/90 bg-eos-voltline/10 font-mono text-xl text-eos-on-surface">
                86
              </div>
              <div>
                <p className="font-display text-xl font-semibold tracking-tight text-eos-on-surface">
                  Peak readiness
                </p>
                <p className="mt-1 text-sm leading-5 text-eos-on-surface-muted">
                  High strain window open for 42 minutes.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
