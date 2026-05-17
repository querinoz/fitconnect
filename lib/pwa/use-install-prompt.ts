"use client";

import { useEffect, useState, useCallback } from "react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const prompt = useCallback(async () => {
    if (!evt) return "unavailable" as const;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    setEvt(null);
    return outcome;
  }, [evt]);

  return { canInstall: !!evt, prompt };
}
