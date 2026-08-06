"use client";

import { useRef, useEffect } from "react";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/motion/gsap-register";
import { shouldReduceMotion } from "@/lib/motion/should-reduce-motion";
import { TrustStrip } from "@/components/marketing/trust-strip";

const BRANDS = ["Strava", "Whoop", "Garmin", "Oura", "Apple Health", "FitConnect Verified"];

export function TrustStripMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (shouldReduceMotion()) return;

    registerGsapPlugins();

    // Drive marquee with GSAP so we can adjust timeScale from velocity.
    // The track holds 2 identical copies → translating by -(width/2) = one full loop.
    const tween = gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -(track.offsetWidth / 2),
        duration: 28,
        ease: "none",
        repeat: -1,
        invalidateOnRefresh: true
      }
    );

    // Link scroll velocity to marquee speed (timeScale) + subtle skew.
    const obs = ScrollTrigger.observe({
      type: "scroll",
      onChangeY(self) {
        const vel = Math.abs(self.velocityY ?? 0);
        const targetScale = 1 + Math.min(vel / 140, 3.5);
        gsap.to(tween, {
          timeScale: targetScale,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto"
        });
        gsap.to(track, {
          skewX: -Math.sign(self.velocityY ?? 1) * Math.min(vel / 280, 2.8),
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      },
      onStop() {
        gsap.to(tween, { timeScale: 1, duration: 1.4, ease: "power3.out", overwrite: "auto" });
        gsap.to(track, { skewX: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
      }
    });

    return () => {
      tween.kill();
      obs.kill();
    };
  }, []);

  return (
    <div className="landing-v2-trust relative z-10 -mt-px border-b border-white/5 bg-[var(--eos-floor)]/80 backdrop-blur-md">
      <TrustStrip />
      <div className="overflow-hidden border-t border-white/5 py-3" aria-hidden>
        <div ref={trackRef} className="flex w-max gap-10 px-4">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10">
              {BRANDS.map((name) => (
                <span
                  key={`${copy}-${name}`}
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-eos-on-surface-subtle"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
