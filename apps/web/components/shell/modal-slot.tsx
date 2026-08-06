"use client";

import { AnimatePresence } from "motion/react";

/** Enables exit animations for parallel `@modal` intercepting routes. */
export function ModalSlot({ children }: { children: React.ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
