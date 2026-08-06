"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useStitchMobile } from "@/lib/hooks/use-media-query";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";

const STITCH_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Route swap — Stitch y/scale on mobile tabs; opacity fade on desktop.
 */
export function EliteRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const stitchMobile = useStitchMobile();
  const { fadeIn } = useEliteMotion();

  if (reduced) {
    return (
      <div key={pathname} className="min-h-full fc-stitch-screen-enter">
        {children}
      </div>
    );
  }

  if (stitchMobile) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          className="min-h-full hide-scrollbar overflow-x-hidden"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.24, ease: STITCH_EASE }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="min-h-full"
        initial={fadeIn.initial}
        animate={fadeIn.animate}
        exit={fadeIn.exit}
        transition={fadeIn.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
