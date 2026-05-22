"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, registerGsapPlugins } from "@/lib/motion/gsap-register";
import { cn } from "@/lib/utils";

type SectionBreakProps = {
  lineOne: string;
  lineTwo: string;
  className?: string;
};

/** Editorial giant split headline — Lando "ON / TRACK" pattern. */
export function SectionBreak({ lineOne, lineTwo, className }: SectionBreakProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      registerGsapPlugins();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const root = ref.current;
      if (!root || reduced) return;

      gsap.from(root.querySelector(".section-break-left"), {
        x: -80,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 85%" }
      });
      gsap.from(root.querySelector(".section-break-right"), {
        x: 80,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 85%" }
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      className={cn(
        "relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20 md:py-24",
        className
      )}
      aria-hidden
    >
      <p
        className="section-break-left font-display text-[clamp(2.5rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-ink-50"
      >
        {lineOne}
      </p>
      <p
        className="section-break-right mt-2 text-right font-display text-[clamp(2.5rem,10vw,7.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-volt-500"
      >
        {lineTwo}
      </p>
    </section>
  );
}
