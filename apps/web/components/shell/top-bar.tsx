"use client";

import Image from "next/image";

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
    <header className="relative px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={avatarUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border border-glass-border object-cover shrink-0 ring-1 ring-volt-500/20"
        />
        <div className="min-w-0">
          {tabLabel ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-volt-400">
                {tabLabel}
              </p>
              <p className="text-base font-semibold truncate text-ink-50">{name}</p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
                {greeting}
              </p>
              <p className="text-base font-semibold truncate">{name}</p>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
