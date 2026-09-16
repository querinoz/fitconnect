"use client";

import { MOTION_TOKENS } from "@fitconnect/design-tokens";
import { useReducedMotion } from "motion/react";

/** @deprecated Prefer MOTION_TOKENS / zenithMotion — kept as stable re-export. */
export const MOTION = {
  micro: MOTION_TOKENS.micro,
  screen: MOTION_TOKENS.zenith.slow,
  entrance: MOTION_TOKENS.zenith.cinematic,
  ease: MOTION_TOKENS.ease.kinetic
} as const;

/** Stable entrance — never flips to opacity:0 after mount (prevents stuck/infinite loops). */
export function useEntrance() {
  return {
    initial: false as const,
    animate: { opacity: 1, y: 0 }
  };
}

/** whileInView entrance for below-the-fold sections. */
export function useInViewEntrance(y = 24) {
  const reduce = useReducedMotion();

  return {
    initial: reduce ? false : { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 as const },
    transition: {
      duration: reduce ? 0 : MOTION_TOKENS.zenith.cinematic,
      ease: MOTION_TOKENS.ease.kinetic
    }
  };
}

/** Screen/tab transition props (opacity + transform only). */
export function useScreenTransition(reduce: boolean | null) {
  const disabled = !!reduce;
  return {
    initial: { opacity: 0, y: disabled ? 0 : 12, scale: disabled ? 1 : 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: disabled ? 0 : -8, scale: disabled ? 1 : 0.985 },
    transition: {
      duration: disabled ? 0 : MOTION_TOKENS.zenith.slow,
      ease: MOTION_TOKENS.ease.surface
    }
  };
}
