import { EOS_MOTION } from "@/lib/design-system/tokens";
import type { Transition } from "framer-motion";

export type EliteMotionPreset = {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
  transition: Transition;
};

const easeOut = EOS_MOTION.easeOut;

/** Framer Motion presets aligned with Elite OS motion tokens. */
export const eliteFadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: EOS_MOTION.duration.ui, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: EOS_MOTION.duration.micro, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteSpring = {
  type: "spring" as const,
  stiffness: EOS_MOTION.spring.stiffness,
  damping: EOS_MOTION.spring.damping,
  mass: EOS_MOTION.spring.mass
};

export const eliteStagger = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

export const eliteHoverDepth = {
  whileHover: { y: -2, transition: eliteSpring },
  whileTap: { scale: 0.985 }
};

export const eliteOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: EOS_MOTION.duration.ui, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteSheet = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: { duration: EOS_MOTION.duration.screen, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteModal = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.98 },
  transition: { duration: EOS_MOTION.duration.screen, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteDrawerLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: EOS_MOTION.duration.screen, ease: easeOut }
} satisfies EliteMotionPreset;

export const eliteMorph = {
  transition: { duration: EOS_MOTION.duration.ui, ease: easeOut }
};

export type RouteModalSize = "center" | "sheet" | "fullscreen";

/** Panel motion preset for intercepting route modals. */
export function eliteRoutePanel(size: RouteModalSize): EliteMotionPreset {
  if (size === "sheet") return eliteSheet;
  if (size === "fullscreen") return eliteFadeIn;
  return eliteModal;
}

/** Disable transforms when user prefers reduced motion. */
export function muteEliteMotion(
  preset: EliteMotionPreset,
  reduced: boolean | null
): EliteMotionPreset {
  if (!reduced) return preset;
  return {
    initial: { opacity: 1, x: 0, y: 0, scale: 1 },
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: { opacity: 1, x: 0, y: 0, scale: 1 },
    transition: { duration: 0 }
  };
}
