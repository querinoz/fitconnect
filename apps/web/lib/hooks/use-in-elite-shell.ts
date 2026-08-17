"use client";

import { useEffect, useState } from "react";

/** True when authenticated content renders inside `EliteAppShell`. */
export function useInEliteShell() {
  const [inShell, setInShell] = useState(false);

  useEffect(() => {
    const read = () => {
      const next = document.documentElement.classList.contains("eos-app-shell-active");
      setInShell((prev) => (prev === next ? prev : next));
    };

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
