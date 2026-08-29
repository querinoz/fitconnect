"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSheet } from "./settings-sheet";

type EliteHeaderProps = {
  homeHref?: string;
  compact?: boolean;
  className?: string;
  transparent?: boolean;
};

export function EliteHeader({
  homeHref = "/feed",
  compact = true,
  className,
  transparent = false
}: EliteHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between gap-3",
          !transparent && "border-b border-glass-border/60 bg-ink-950/80 backdrop-blur-glass",
          className
        )}
      >
        <Link
          href={homeHref}
          aria-label="FitConnect — home feed"
          className="inline-flex items-center min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt-500/50 rounded-lg"
        >
          {compact ? (
            <>
              <Image
                src="/brand/logomark-official-256.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain sm:hidden"
                aria-hidden
              />
              <Image
                src="/brand/logo-full-official.png"
                alt=""
                width={180}
                height={48}
                className="h-9 w-auto object-contain hidden sm:block"
                aria-hidden
              />
            </>
          ) : (
            <Image
              src="/brand/logo-full-official.png"
              alt=""
              width={180}
              height={48}
              className="h-9 w-auto object-contain"
              aria-hidden
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          aria-haspopup="dialog"
          className="grid h-11 min-w-11 place-items-center rounded-full border border-glass-border bg-glass-md text-ink-200 hover:bg-glass-hi hover:text-ink-50 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
