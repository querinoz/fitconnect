"use client";

import { useEffect, useState, type ComponentType } from "react";

/**
 * Client island loaded from the server page via next/dynamic.
 * Kept in its own module so the heavy below-fold graph is not an async
 * dependency of the eager landing-page-content / hero bundle.
 *
 * Load on user intent only. An idle timeout during Lighthouse's observation
 * window injected a large DOM subtree and produced CLS ~0.16.
 */
export function BelowFoldAfterHero() {
  const [Below, setBelow] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    let started = false;

    const load = () => {
      void import("@/components/landing/landing-below-fold").then((mod) => {
        if (!cancelled) setBelow(() => mod.LandingBelowFold);
      });
    };

    const loadOnce = () => {
      if (started) return;
      started = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", loadOnce);
      load();
    };

    const onScroll = () => {
      if (window.scrollY >= 8) loadOnce();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", loadOnce, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", loadOnce);
    };
  }, []);

  if (!Below) {
    return <div className="min-h-[80vh]" aria-hidden />;
  }

  return <Below />;
}
