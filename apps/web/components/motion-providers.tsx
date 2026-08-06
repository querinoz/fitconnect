"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { useMounted } from "@/lib/use-mounted";
import { EOS_MOTION } from "@/lib/design-system/tokens";

/** Motion defaults for app routes — Elite OS spring + reduced-motion aware.
 * LazyMotion + domAnimation defers ~86KB of the motion engine until first
 * animated component mounts. Components using <m.X> (not <motion.X>) benefit. */
export function MotionProviders({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig
        reducedMotion="user"
        transition={
          mounted
            ? {
                duration: EOS_MOTION.duration.ui,
                ease: EOS_MOTION.easeOut
              }
            : { duration: 0 }
        }
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
