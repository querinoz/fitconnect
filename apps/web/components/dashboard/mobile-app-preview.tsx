"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion
} from "framer-motion";
import {
  Bell,
  Calendar,
  Home,
  UserRound,
  UsersRound,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";
import { MobileAppHeader } from "@/components/brand/mobile-app-header";
import { cn } from "@/lib/utils";
import { RealtimeBadge } from "@/components/ui-glass/premium-system";
import {
  StitchCoachScreen,
  StitchInboxScreen,
  StitchProfileScreen,
  StitchSessionsScreen,
  StitchTodayScreen
} from "@/components/mobile/stitch-screens";
import type { DashboardPreviewRole } from "./role-dashboard-preview";
import { useLocale } from "@/lib/i18n-provider";

type MobileScreen = "today" | "sessions" | "coach" | "inbox" | "profile";

type MobileAppPreviewProps = {
  initialRole?: DashboardPreviewRole;
};

export function MobileAppPreview({
  initialRole = "athlete"
}: MobileAppPreviewProps) {
  const [screen, setScreen] = useState<MobileScreen>("today");
  const [sessionLive, setSessionLive] = useState(false);
  const [planApproved, setPlanApproved] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [streak, setStreak] = useState(35);
  const isCoach = initialRole === "coach";
  const reduce = useReducedMotion();
  const m = useLocale().mobileApp;

  const nav = useMemo(
    () => [
      { id: "today" as const, label: m.nav.today, icon: Home },
      { id: "sessions" as const, label: m.nav.sessions, icon: Calendar },
      {
        id: "coach" as const,
        label: isCoach ? m.nav.roster : m.nav.coach,
        icon: isCoach ? UsersRound : UserRound
      },
      { id: "inbox" as const, label: m.nav.inbox, icon: Bell },
      { id: "profile" as const, label: m.nav.profile, icon: UserRound }
    ],
    [isCoach, m.nav]
  );

  return (
    <div className="relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-ink-950 text-ink-100 premium-grid">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-volt-500/12 via-brand-500/5 to-transparent"
      />
      <div className="relative shrink-0 px-3 pb-2 pt-1 sm:px-4">
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

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2 hide-scrollbar sm:px-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8, scale: reduce ? 1 : 0.985 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {screen === "today" && (
              <StitchTodayScreen
                isCoach={isCoach}
                readinessScore={isCoach ? 84 : 82}
                hrvMs={isCoach ? 3 : 68}
                streakDays={streak}
                sleepHours="7h42"
                sessionLive={sessionLive}
                planApproved={planApproved}
                onStartSession={() => {
                  setScreen("sessions");
                  setSessionLive(true);
                }}
                onApprovePlan={() => setPlanApproved(true)}
              />
            )}
            {screen === "sessions" && (
              <StitchSessionsScreen
                sessionLive={sessionLive}
                onStart={() => setSessionLive(true)}
                onEnd={() => {
                  setSessionLive(false);
                  setStreak((value) => value + 1);
                }}
              />
            )}
            {screen === "coach" && (
              <StitchCoachScreen
                isCoach={isCoach}
                messageSent={messageSent}
                onSendCheckIn={() => {
                  setMessageSent(true);
                  setScreen("inbox");
                }}
              />
            )}
            {screen === "inbox" && (
              <StitchInboxScreen
                planApproved={planApproved}
                messageSent={messageSent}
                onApprovePlan={() => setPlanApproved(true)}
              />
            )}
            {screen === "profile" && (
              <StitchProfileScreen
                name={isCoach ? m.profile.coachName : m.profile.athleteName}
                subtitle={isCoach ? m.profile.coachRole : m.profile.athleteRole}
                streakDays={streak}
                readinessScore={isCoach ? 84 : 82}
                isCoach={isCoach}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav
        aria-label={m.nav.ariaLabel}
        className="mx-2 mb-2 mt-auto shrink-0 rounded-glass-lg border border-glass-border bg-glass-md px-1 py-1.5 backdrop-blur-glass-lg shadow-volt-glow safe-area-pb sm:mx-3 sm:mb-2 sm:px-1.5 sm:py-2"
      >
        <ul className="flex items-center justify-between">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setScreen(item.id)}
                  className={cn(
                    "grid h-11 min-w-11 place-items-center rounded-full transition-all",
                    active
                      ? "bg-grad-pulse text-ink-950"
                      : "text-ink-500 hover:text-ink-100"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
