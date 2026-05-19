"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LazyInViewProps = {
  children: ReactNode;
  minHeight?: number;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  /** Load immediately — for above-the-fold content */
  eager?: boolean;
  /** Skip content-visibility deferral (prevents frozen/blank sections) */
  noDefer?: boolean;
};

export function LazyInView({
  children,
  minHeight = 320,
  className,
  rootMargin = "120px 0px",
  threshold = 0.01,
  eager = false,
  noDefer = false
}: LazyInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || visible) return;
    const el = ref.current;
    if (!el) return;

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
  }, [visible, rootMargin, threshold, eager]);

  return (
    <div
      ref={ref}
      className={cn(!noDefer && "fc-defer-section", className)}
      style={{ minHeight: visible ? undefined : minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}
