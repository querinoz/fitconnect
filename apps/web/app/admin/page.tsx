"use client";

import { getAdminKpis } from "@/lib/admin/kpis";
import { formatPrice } from "@/lib/utils";
import { RealtimeBadge } from "@/components/ui-glass/premium-system";

export default function AdminOverviewPage() {
  const kpis = getAdminKpis();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin overview</h1>
          <p className="mt-2 text-sm text-ink-400">Live KPIs · demo data</p>
        </div>
        <RealtimeBadge>Realtime sync</RealtimeBadge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Paid athletes", value: kpis.paidAthletes.toLocaleString() },
          { label: "Verified coaches", value: kpis.verifiedCoaches.toLocaleString() },
          { label: "MRR", value: formatPrice(kpis.mrrEur) },
          { label: "Sessions this week", value: String(kpis.sessionsThisWeek) },
          {
            label: "Goal completion",
            value: `${Math.round(kpis.goalCompletionRate * 100)}%`
          },
          { label: "Pending verifications", value: String(kpis.pendingVerifications) }
        ].map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-ink-800 bg-ink-950/60 p-5"
          >
            <p className="text-xs uppercase tracking-widest text-ink-500">{kpi.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-50">{kpi.value}</p>
          </article>
        ))}
      </div>
    </>
  );
}
