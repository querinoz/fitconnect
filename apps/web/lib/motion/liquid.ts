/** Shared liquid / glass motion tokens for Framer Motion. */
export const LIQUID_EASE = [0.16, 1, 0.3, 1] as const;

export const liquidContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 }
  }
};

export const liquidItem = {
  hidden: { opacity: 0, y: 18, scale: 0.97, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: LIQUID_EASE }
  }
};

export const liquidItemReduced = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  show: { opacity: 1, y: 0, scale: 1 }
};

export const liquidPress = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02, y: -2 },
  transition: { type: "spring" as const, stiffness: 420, damping: 28 }
};
