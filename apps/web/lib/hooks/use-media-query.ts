"use client";

import { useEffect, useState } from "react";
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** Matches Tailwind `lg` — mobile dock layout vs desktop cockpit. */
export function useCompactMobileLayout() {
  return useMediaQuery("(max-width: 1023px)");
}

/** Authenticated mobile uses Stitch chrome + compact tab screens. */
export function useStitchMobile() {
  const compact = useCompactMobileLayout();
  const [inShell, setInShell] = useState(false);

  useEffect(() => {
    const read = () =>
      setInShell(document.documentElement.classList.contains("eos-app-shell-active"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  return compact && inShell;
}
