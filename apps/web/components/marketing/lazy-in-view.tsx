"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LazyInViewProps = {
  children: ReactNode;
  /** Placeholder height to avoid layout shift */
  minHeight?: number;
  className?: string;
  /** Intersection root margin — smaller = later load */
  rootMargin?: string;
  /** Fraction of element that must be visible before loading */
  threshold?: number;
};

/**
 * Defers mounting (and dynamic import) of heavy below-fold sections until
 * the user scrolls near them. Critical for landing Lighthouse mobile scores.
 */
export function LazyInView({
  children,
  minHeight = 320,
  className,
  rootMargin = "120px 0px",
  threshold = 0.01
}: LazyInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin, threshold]);

  return (
    <div
      ref={ref}
      className={cn("fc-defer-section", className)}
      style={{ minHeight: visible ? undefined : minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}
