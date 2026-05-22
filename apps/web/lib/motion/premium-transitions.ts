/** Shared Framer Motion presets — premium SaaS motion language. */
export const FC_EASE = [0.16, 1, 0.3, 1] as const;

export const fcFadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.35, ease: FC_EASE }
};

export const fcFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: FC_EASE }
};

export const fcStaggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 }
  }
};

export const fcSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8
};

export const fcHoverLift = {
  whileHover: { y: -2, transition: fcSpring },
  whileTap: { scale: 0.985 }
};
