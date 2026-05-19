"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export function CelebrationOverlay({
  title,
  value,
  onClose,
  durationMs = 2000
}: {
  title: string;
  value: string;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [onClose, durationMs]);

  return (
    <motion.div
      data-testid="celebration-overlay"
      role="alertdialog"
      aria-label={`${title} ${value}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 grid place-items-center pointer-events-none"
      style={{
        background:
          "radial-gradient(80% 80% at 50% 50%, rgba(199,251,58,.18), rgba(7,8,10,.6))"
      }}
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-volt-500">{title}</p>
        <p className="text-7xl sm:text-8xl font-black bg-grad-text bg-clip-text text-transparent leading-none mt-2">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
