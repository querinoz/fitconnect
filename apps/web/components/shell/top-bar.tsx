"use client";

import Image from "next/image";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";
import type { UserRole } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function TopBar({
  greeting,
  name,
  avatarUrl,
  tabLabel,
  roleLabel,
  role
}: {
  greeting: string;
  name: string;
  avatarUrl: string;
  /** When set, shows the active dock tab name (non-home routes). */
  tabLabel?: string;
  /** Coach OS / Athlete OS badge for role clarity. */
  roleLabel?: string;
  role?: UserRole;
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
          {roleLabel ? (
            <span
              className={cn(
                "mb-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
                role === "coach"
                  ? "border-lime-500/30 bg-lime-500/10 text-lime-400"
                  : "border-brand-400/30 bg-brand-400/10 text-brand-400"
              )}
            >
              {roleLabel}
            </span>
          ) : null}
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
