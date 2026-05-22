"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type RouteModalProps = {
  children: ReactNode;
  title?: string;
  size?: "center" | "sheet" | "fullscreen";
  className?: string;
};

/** URL-backed overlay — closes with router.back() for native-app feel. */
export function RouteModal({
  children,
  title,
  size = "center",
  className
}: RouteModalProps) {
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const panelClass =
    size === "sheet"
      ? "ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-glass-border"
      : size === "fullscreen"
        ? "h-full w-full overflow-y-auto"
        : "my-auto w-full max-w-lg overflow-y-auto";

  return (
    <div className="fixed inset-0 z-[100] flex">
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink-950/75 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.25 }}
        onClick={() => router.back()}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn("relative z-[101] flex min-h-0 flex-1 p-4 sm:p-6", panelClass, className)}
        initial={{ opacity: 0, y: reduce ? 0 : size === "sheet" ? 0 : 16, x: reduce ? 0 : size === "sheet" ? 40 : 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : 12, x: reduce ? 0 : size === "sheet" ? 24 : 0 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-6 top-6 z-10 grid h-9 w-9 place-items-center rounded-full border border-glass-border bg-glass-md text-ink-200 transition hover:border-volt-500/30 hover:text-volt-300"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
