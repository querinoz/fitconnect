"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/toast/store";
import { cn } from "@/lib/utils";

const toneClass = {
  success: "border-accent-500/40 bg-accent-500/10 text-accent-200",
  error: "border-signal-500/40 bg-signal-500/10 text-signal-200",
  info: "border-plasma-500/40 bg-plasma-500/10 text-plasma-200"
};

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts.at(-1);
    if (!latest) return;
    const id = window.setTimeout(() => dismiss(latest.id), 4500);
    return () => window.clearTimeout(id);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 text-left shadow-elevated backdrop-blur-md",
            toneClass[t.tone]
          )}
        >
          <p className="text-sm font-semibold">{t.title}</p>
          {t.body && <p className="mt-1 text-xs opacity-90">{t.body}</p>}
        </button>
      ))}
    </div>
  );
}
