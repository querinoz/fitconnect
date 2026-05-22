"use client";

import { MotionConfig } from "framer-motion";
import { useMounted } from "@/lib/use-mounted";
import { EOS_MOTION } from "@/lib/design-system/tokens";

/** Motion defaults for app routes — Elite OS spring + reduced-motion aware. */
export function MotionProviders({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  return (
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
  );
}
