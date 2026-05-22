"use client";

import { useEffect, useState } from "react";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

const INTRO_KEY = "fc-intro-seen";
const INTRO_MS = 3200;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduced"
  );
}

/** Cinematic app open intro — once per browser session; skipped on landing (has HeroGate). */
export function AppIntroSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/") return;
    if (prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return;
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* private mode — still show once */
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fc-intro-splash" aria-hidden>
      <div className="fc-intro-splash-vignette" />
      <svg className="fc-intro-ekg" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden>
        <path
          className="fc-intro-ekg-path"
          d="M0 20 H80 L96 6 L112 34 L128 20 H400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className={cn("fc-intro-logo", "fc-intro-logo-reveal")}>
        <BrandLogo size={128} priority className="fc-logo-mark" />
      </div>
      <div className="fc-intro-flash" aria-hidden />
    </div>
  );
}
