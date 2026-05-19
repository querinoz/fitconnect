"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: number;
};

export function TiltCard({ children, className, intensity = 12 }: TiltCardProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 22 });
  const glare = useTransform(springY, [-intensity, intensity], [0.08, 0.18]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * intensity);
    rotateX.set(-y * intensity);
  }

  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  if (reduce) {
    return (
      <div className={cn("rounded-2xl border border-ink-800 bg-ink-900/50", className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 900
      }}
      className={cn(
        "group relative rounded-2xl border border-ink-800/90 bg-ink-900/55 backdrop-blur-sm transition-shadow hover:border-ink-700 hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.65)]",
        className
      )}
    >
      <motion.div
        aria-hidden
        style={{ opacity: glare }}
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-volt-500/20 via-transparent to-brand-400/10"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
