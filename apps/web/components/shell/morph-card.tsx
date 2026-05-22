"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { eliteMorph } from "@/lib/motion/elite-motion";

type MorphCardProps = Omit<HTMLMotionProps<"div">, "layoutId"> & {
  morphId: string;
  children: ReactNode;
};

export function MorphCard({ morphId, children, className, ...rest }: MorphCardProps) {
  return (
    <motion.div
      layoutId={morphId}
      transition={eliteMorph.transition}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
