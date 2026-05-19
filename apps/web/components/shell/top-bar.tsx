"use client";

import Image from "next/image";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";

export function TopBar({
  greeting,
  name,
  avatarUrl,
  tabLabel
}: {
  greeting: string;
  name: string;
  avatarUrl: string;
  /** When set, shows the active dock tab name (non-home routes). */
  tabLabel?: string;
}) {
  return (
    <div className="relative shrink-0 border-b border-[var(--border-xs)] bg-carbon-1/60 backdrop-blur-xl">
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-2 sm:px-5">
        <MobileAppHeader
          trailing={
            <Image
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-glass-border object-cover ring-1 ring-volt-500/20"
            />
          }
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-3 sm:px-5">
        <div className="min-w-0">
          {tabLabel ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-volt-400">
                {tabLabel}
              </p>
              <p className="truncate text-base font-semibold text-ink-50">{name}</p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
                {greeting}
              </p>
              <p className="truncate text-base font-semibold">{name}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
