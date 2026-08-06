"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
let premiumRegistered = false;
let premiumLoading: Promise<GsapPremiumPlugins> | null = null;

export type GsapPremiumPlugins = {
  SplitText: typeof import("gsap/SplitText").SplitText;
  Flip: typeof import("gsap/Flip").Flip;
  DrawSVGPlugin: typeof import("gsap/DrawSVGPlugin").DrawSVGPlugin;
  MorphSVGPlugin: typeof import("gsap/MorphSVGPlugin").MorphSVGPlugin;
  Draggable: typeof import("gsap/Draggable").Draggable;
};

let cachedPlugins: GsapPremiumPlugins | null = null;

/** Register core GSAP plugins once (client-only). Call this in any GSAP-driven component. */
export function registerGsapPlugins(): typeof gsap {
  if (typeof window === "undefined") return gsap;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

/**
 * Register and return GSAP premium plugins (free since GSAP 3.12+).
 * Idempotent and deduped — subsequent calls return the cached promise.
 *
 * SplitText — per-character/word/line stagger animations
 * Flip      — layout-aware animate-between-states
 * DrawSVG   — SVG path stroke animation
 * MorphSVG  — SVG path morphing
 * Draggable — drag with momentum
 */
export function registerGsapPremium(): Promise<GsapPremiumPlugins> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Server: cannot register GSAP plugins"));
  }
  if (cachedPlugins) return Promise.resolve(cachedPlugins);
  if (premiumLoading) return premiumLoading;

  premiumLoading = Promise.all([
    import("gsap/SplitText"),
    import("gsap/Flip"),
    import("gsap/DrawSVGPlugin"),
    import("gsap/MorphSVGPlugin"),
    import("gsap/Draggable"),
  ]).then(([{ SplitText }, { Flip }, { DrawSVGPlugin }, { MorphSVGPlugin }, { Draggable }]) => {
    if (!premiumRegistered) {
      gsap.registerPlugin(SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin, Draggable);
      premiumRegistered = true;
    }
    cachedPlugins = { SplitText, Flip, DrawSVGPlugin, MorphSVGPlugin, Draggable };
    return cachedPlugins;
  });

  return premiumLoading;
}

export { gsap, ScrollTrigger };
