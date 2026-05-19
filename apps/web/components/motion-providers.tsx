"use client";

import { MotionConfig } from "framer-motion";
import { useMounted } from "@/lib/use-mounted";

/** Motion defaults for app routes — kept out of marketing critical path. */
export function MotionProviders({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  return (
    <MotionConfig
      reducedMotion="user"
      transition={mounted ? undefined : { duration: 0 }}
    >
      {children}
    </MotionConfig>
  );
}
