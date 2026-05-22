"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";

/**
 * Route swap — opacity-only to avoid mobile tab visibility bugs from y-offset exits.
 */
export function EliteRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { fadeIn } = useEliteMotion();

  if (reduced) {
    return (
      <div key={pathname} className="min-h-full fc-mobile-page-enter">
        {children}
      </div>
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
