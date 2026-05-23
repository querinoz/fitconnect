"use client";

import { UsersRound, Zap } from "lucide-react";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";
import { RealtimeBadge } from "@/components/ui-glass/premium-system";
import type { UserRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n-provider";

/** Stitch header + sync strip for authenticated mobile shell. */
export function StitchMobileChrome({ role }: { role: UserRole; name?: string }) {
  const m = useLocale().mobileApp;
  const isCoach = role === "coach";

  return (
    <div className="relative shrink-0 lg:hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-4 h-32 bg-gradient-to-b from-volt-500/12 via-brand-500/5 to-transparent"
      />
      <div className="relative px-3 pb-2 pt-[calc(env(safe-area-inset-top)+4px)] sm:px-4">
        <MobileAppHeader
          trailing={
            <span className="rounded-full border border-volt-500/30 bg-volt-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-volt-300">
              {m.voltline}
            </span>
          }
          eyebrow={isCoach ? m.header.coachEyebrow : m.header.athleteEyebrow}
          title={isCoach ? m.header.coachGreeting : m.header.athleteGreeting}
          action={
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-grad-pulse text-ink-950 shadow-volt-glow ring-1 ring-volt-500/30 sm:h-10 sm:w-10 sm:rounded-2xl">
              {isCoach ? (
                <UsersRound className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </span>
          }
        />
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-full border border-volt-500/20 bg-glass-md px-3 py-1.5 backdrop-blur-glass shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <RealtimeBadge>{m.header.syncBadge}</RealtimeBadge>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            {m.header.syncAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
