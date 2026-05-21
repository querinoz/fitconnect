"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { formatMsg, useT } from "@/lib/i18n-provider";

const FitConnectMap = dynamic(
  () => import("@/components/map/fit-connect-map").then((m) => m.FitConnectMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[280px] place-items-center rounded-2xl border border-ink-800 bg-ink-900/40 text-xs text-ink-500">
        …
      </div>
    )
  }
);

type CoachRosterMapProps = {
  athleteCount?: number;
};

export function CoachRosterMap({ athleteCount = 34 }: CoachRosterMapProps) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-lime-400" />
            <h3 className="font-display text-base font-bold text-ink-100">
              {t("coachDashboard", "rosterMapTitle")}
            </h3>
          </div>
          <p className="text-xs text-ink-500">
            {formatMsg(t("coachDashboard", "rosterMapSubtitle"), {
              count: athleteCount
            })}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-lime-500/20 bg-lime-500/10 px-2.5 py-1 text-[10px] font-semibold text-lime-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
          {t("coachDashboard", "live")}
        </span>
      </div>
      <FitConnectMap mode="coach" height={280} className="rounded-2xl" />
    </div>
  );
}
