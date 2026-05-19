"use client";

import Link from "next/link";
import { PremiumCard, MetricTile } from "@/components/ui-glass/premium-system";
import type { DashboardAthlete } from "@/lib/dashboard/types";

export function RosterList({
  roster,
  loading
}: {
  roster: DashboardAthlete[] | Array<{
    externalId?: string;
    id?: string;
    name: string;
    avatar: string;
    readiness: number;
    recoveryStatus: string;
  }>;
  loading?: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-ink-400">Loading roster…</p>;
  }
  if (!roster.length) {
    return <p className="text-sm text-ink-400">No athletes on this roster.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {roster.map((a) => {
        const id = "externalId" in a && a.externalId ? a.externalId : a.id!;
        const status =
          "recoveryStatus" in a
            ? typeof a.recoveryStatus === "string"
              ? a.recoveryStatus.toLowerCase()
              : "green"
            : "green";
        return (
          <li key={id}>
            <Link href={`/coach/athletes/${id}`}>
              <PremiumCard className="p-4 transition hover:border-volt-500/30">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt=""
                    className="h-11 w-11 rounded-2xl object-cover ring-1 ring-glass-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-50">{a.name}</p>
                    <p className="text-xs capitalize text-ink-400">{status} readiness</p>
                  </div>
                  <MetricTile label="Score" value={String(a.readiness)} />
                </div>
              </PremiumCard>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
