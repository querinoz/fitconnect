"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutDashboard, UserRound } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n-provider";
import { PreviewAthlete } from "./preview-athlete";
import { PreviewCoach } from "./preview-coach";

export type DashboardPreviewRole = "athlete" | "coach";

export function RoleDashboardPreview() {
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [role, setRole] = useState<DashboardPreviewRole>("athlete");
  const tabsId = useId();

  const tabs: { id: DashboardPreviewRole; label: string; icon: typeof UserRound }[] =
    [
      { id: "athlete", label: locale.dashboardPreview.athleteTab, icon: UserRound },
      { id: "coach", label: locale.dashboardPreview.coachTab, icon: LayoutDashboard }
    ];

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label={locale.dashboardPreview.tabsAria}
        className="inline-flex p-1 rounded-2xl border border-ink-800 bg-ink-950/80 backdrop-blur-sm"
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
                "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                active ? "text-ink-50" : "text-ink-400 hover:text-ink-200"
              )}
            >
              {active && (
                <motion.span
                  layoutId="dashboard-preview-tab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/20 to-accent-500/20 ring-1 ring-brand-400/40"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              )}
              <tab.icon className="relative h-4 w-4 shrink-0" aria-hidden />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tabsId}-panel`}
        aria-labelledby={`${tabsId}-${role}`}
        className="mt-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {role === "athlete" ? <PreviewAthlete /> : <PreviewCoach />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
