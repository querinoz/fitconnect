"use client";

import { useReducedMotion } from "framer-motion";

/** Standard FitConnect motion timings (seconds). */
export const MOTION = {
  micro: 0.18,
  screen: 0.28,
  entrance: 0.4,
  ease: [0.16, 1, 0.3, 1] as const
};

/** Stable entrance — never flips to opacity:0 after mount (prevents stuck/infinite loops). */
export function useEntrance(_y = 20) {
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
    transition: { duration: reduce ? 0 : MOTION.entrance, ease: MOTION.ease }
  };
}

/** Screen/tab transition props (opacity + transform only). */
export function useScreenTransition(reduce: boolean | null) {
  const disabled = !!reduce;
  return {
    initial: { opacity: 0, y: disabled ? 0 : 12, scale: disabled ? 1 : 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: disabled ? 0 : -8, scale: disabled ? 1 : 0.985 },
    transition: { duration: disabled ? 0 : MOTION.screen, ease: MOTION.ease }
  };
}
