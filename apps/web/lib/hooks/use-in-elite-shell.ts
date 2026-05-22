"use client";

import { useEffect, useState } from "react";

/** True when authenticated content renders inside `EliteAppShell`. */
export function useInEliteShell() {
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

  return inShell;
}
