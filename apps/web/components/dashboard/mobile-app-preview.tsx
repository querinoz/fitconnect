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
  UsersRound
} from "lucide-react";
import { useMemo, useState } from "react";
import { StitchNativeHeader } from "@/components/mobile/stitch-native-primitives";
import { cn } from "@/lib/utils";
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
    <div className="relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-[#070B14] text-ink-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] top-[-10%] h-[50vw] w-[50vw] rounded-full bg-[#c8ff00]/5 blur-[120px]"
      />
      <div className="relative shrink-0">
        <StitchNativeHeader initials={isCoach ? "CD" : "PA"} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-2 hide-scrollbar">
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
        className="mx-auto mb-2 mt-auto w-[calc(100%-3rem)] max-w-md shrink-0 rounded-full border border-white/10 bg-[#1f1f28]/80 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl safe-area-pb"
      >
        <ul className="flex items-center justify-around">
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
                    "grid h-12 w-12 place-items-center rounded-full transition-all",
                    active
                      ? "bg-[#c0f500] text-[#161f00] shadow-[0_0_15px_rgba(200,255,0,0.4)]"
                      : "text-ink-400 hover:bg-white/5 hover:text-[#c0f500]"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
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
