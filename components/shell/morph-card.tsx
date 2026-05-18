"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type MorphCardProps = Omit<HTMLMotionProps<"div">, "layoutId"> & {
  morphId: string;
  children: ReactNode;
};

export function MorphCard({ morphId, children, className, ...rest }: MorphCardProps) {
  return (
    <motion.div
      layoutId={morphId}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
