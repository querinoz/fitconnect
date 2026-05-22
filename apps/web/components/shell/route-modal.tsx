"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";
import { cn } from "@/lib/utils";

type RouteModalProps = {
  children: ReactNode;
  title?: string;
  size?: "center" | "sheet" | "fullscreen";
  className?: string;
};

/** URL-backed overlay — closes with router.back(); motion via Elite OS presets. */
export function RouteModal({
  children,
  title,
  size = "center",
  className
}: RouteModalProps) {
  const router = useRouter();
  const { overlay, routePanel } = useEliteMotion();
  const panelMotion = routePanel(size);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const panelClass =
    size === "sheet"
      ? "ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-eos-outline eos-glass"
      : size === "fullscreen"
        ? "h-full w-full overflow-y-auto"
        : "my-auto w-full max-w-lg overflow-y-auto";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-eos-floor/80 backdrop-blur-xl"
        initial={overlay.initial}
        animate={overlay.animate}
        exit={overlay.exit}
        transition={overlay.transition}
        onClick={() => router.back()}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-[101] flex min-h-0 flex-1 p-4 sm:p-6",
          size === "center" && "eos-glass rounded-[var(--eos-radius-modal)]",
          panelClass,
          className
        )}
        initial={panelMotion.initial}
        animate={panelMotion.animate}
        exit={panelMotion.exit}
        transition={panelMotion.transition}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-6 top-6 z-10 grid h-9 w-9 place-items-center rounded-[var(--eos-radius-control)] border border-eos-outline bg-eos-glass text-eos-on-surface-muted transition hover:border-eos-voltline/30 hover:text-eos-voltline"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
