"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import {
  liquidContainer,
  liquidItem,
  liquidItemReduced
} from "@/lib/motion/liquid";
import { cn } from "@/lib/utils";

export function MotionStack({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={liquidContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={reduce ? liquidItemReduced : liquidItem}
    >
      {children}
    </motion.div>
  );
}
