"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { eliteFadeUp } from "@/lib/motion/elite-motion";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";
import { cn } from "@/lib/utils";

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

/** Staggered entrance for dashboard bento sections. */
export function EliteBentoMotion({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reduced } = useEliteMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}

export function EliteBentoMotionItem({
  children,
  className,
  id
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const { mute, reduced } = useEliteMotion();
  const item = mute(eliteFadeUp);

  if (reduced) {
    return (
      <div className={className} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      id={id}
      variants={{
        initial: item.initial,
        animate: item.animate
      }}
      transition={item.transition}
    >
      {children}
    </motion.div>
  );
}
