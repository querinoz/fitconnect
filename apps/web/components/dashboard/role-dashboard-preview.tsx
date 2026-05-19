"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, UserRound } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";
import { IphoneFrame } from "@/components/marketing/iphone-frame";
import { MobileAppPreview } from "./mobile-app-preview";
import { PreviewAthlete } from "./preview-athlete";
import { PreviewCoach } from "./preview-coach";

export type DashboardPreviewRole = "athlete" | "coach";

type RoleDashboardPreviewProps = {
  /** `phone` wraps content in iPhone chrome; `browser` uses desktop-style frames */
  variant?: "phone" | "browser";
  /** Smaller fixed-height frame for landing dashboard section */
  compact?: boolean;
};

export function RoleDashboardPreview({
  variant = "phone",
  compact = false
}: RoleDashboardPreviewProps) {
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [role, setRole] = useState<DashboardPreviewRole>("athlete");
  const tabsId = useId();
  const tabLayoutId = `${tabsId}-dashboard-preview-tab`;
  const frameless = variant === "phone";

  const tabs: {
    id: DashboardPreviewRole;
    label: string;
    icon: typeof UserRound;
  }[] = [
    {
      id: "athlete",
      label: locale.dashboardPreview.athleteTab,
      icon: UserRound
    },
    {
      id: "coach",
      label: locale.dashboardPreview.coachTab,
      icon: LayoutDashboard
    }
  ];

  const panel = (
    <>
      <div
        role="tablist"
        aria-label={locale.dashboardPreview.tabsAria}
        className={cn(
          "inline-flex rounded-2xl border border-[var(--border-xs)] bg-carbon-2/90 p-1 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          frameless &&
            (compact
              ? "mx-auto mt-1 w-[calc(100%-0.75rem)] max-w-[280px] sm:w-[calc(100%-1rem)]"
              : "mx-2 mt-1 w-[calc(100%-1rem)] sm:mx-3 sm:w-[calc(100%-1.5rem)]")
        )}
      >
        {tabs.map((tab) => {
          const active = role === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`${tabsId}-${tab.id}`}
              aria-selected={active}
              aria-controls={`${tabsId}-panel`}
              onClick={() => setRole(tab.id)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors min-h-[40px] sm:gap-2 sm:px-3 sm:text-xs sm:min-h-[44px]",
                active ? "text-ink-50" : "text-ink-400 hover:text-ink-200"
              )}
            >
              {active && (
                <motion.span
                  layoutId={tabLayoutId}
                  className="absolute inset-0 rounded-xl bg-[linear-gradient(145deg,rgba(200,255,0,0.14),rgba(0,221,180,0.08))] ring-1 ring-volt-500/25"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}
              <tab.icon className="relative h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="relative truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-panel`}
        aria-labelledby={`${tabsId}-${role}`}
        className={cn(frameless ? "mt-2 sm:mt-3" : "mt-6")}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role}
            initial={{ opacity: 0, x: reduce ? 0 : role === "coach" ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : role === "coach" ? -16 : 16 }}
            transition={{
              duration: reduce ? 0 : 0.28,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {frameless ? (
              <MobileAppPreview initialRole={role} />
            ) : role === "athlete" ? (
              <PreviewAthlete />
            ) : (
              <PreviewCoach />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );

  if (variant === "browser") {
    return <div className="relative">{panel}</div>;
  }

  const screenHeight = compact
    ? "flex h-[380px] flex-col overflow-hidden sm:h-[420px]"
    : "flex min-h-[min(480px,62dvh)] max-h-[min(720px,85dvh)] flex-col sm:min-h-[540px]";

  const frameWidth = compact
    ? "mx-auto w-full max-w-[280px] sm:max-w-[300px]"
    : "mx-auto w-full max-w-[min(100%,340px)]";

  if (compact) {
    return (
      <div className="fc-dashboard-preview-stage mx-auto w-full max-w-[300px] sm:max-w-[320px]">
        <IphoneFrame className={frameWidth} screenClassName={screenHeight}>
          {panel}
        </IphoneFrame>
      </div>
    );
  }

  return (
    <IphoneFrame className={frameWidth} screenClassName={screenHeight}>
      {panel}
    </IphoneFrame>
  );
}
