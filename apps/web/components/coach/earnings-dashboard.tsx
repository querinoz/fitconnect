"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  COACH_TAKE_HOME_RATE,
  formatEur,
  getCoachEarningsSeries,
  getCoachPayouts
} from "@/lib/coach/earnings";
import { selectCoachMetrics } from "@/lib/dashboard-store";
import { useDashboardStore } from "@/lib/dashboard-store";
import {
  ChartShell,
  MetricTile,
  PremiumCard,
  SectionHeader
} from "@/components/ui-glass/premium-system";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "12px"
};

export function CoachEarningsDashboard({ coachId }: { coachId: string }) {
  const metrics = useDashboardStore((s) => selectCoachMetrics(s, coachId));
  const series = getCoachEarningsSeries(coachId);
  const payouts = getCoachPayouts(coachId);
  const [stripeConnected, setStripeConnected] = useState(coachId === "t-002");

  const chartData = series.map((row) => ({
    month: row.month,
    net: row.coachNetCents / 100
  }));

  const pendingTotal = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.coachShareCents, 0);

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        eyebrow="Coach Pro"
        title="Earnings & payouts"
        body={`${Math.round(COACH_TAKE_HOME_RATE * 100)}% coach take-home · transparent platform fee`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile label="MTD gross" value={metrics.revenueMtd} icon={Wallet} tone="brand" />
        <MetricTile
          label="Pending payout"
          value={formatEur(pendingTotal)}
          delta="T+24h"
          icon={CreditCard}
        />
        <MetricTile
          label="Retention"
          value={`${metrics.retention}%`}
          icon={TrendingUp}
          tone="volt"
        />
        <MetricTile
          label="Active athletes"
          value={String(metrics.activeAthletes)}
          delta="roster"
          icon={Wallet}
          tone="plasma"
        />
      </div>

      <ChartShell title="Net earnings · last 6 months" subtitle="After 15% platform fee">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`€${v.toFixed(0)}`, "Net"]}
              />
              <Bar dataKey="net" fill="#22d3ee" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartShell>

      <PremiumCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-50">Stripe Connect</p>
            <p className="text-xs text-ink-400 mt-1">
              {stripeConnected
                ? "Payouts enabled · next transfer est. Fri"
                : "Complete onboarding to receive session payouts"}
            </p>
          </div>
          {!stripeConnected && (
            <Button type="button" onClick={() => setStripeConnected(true)}>
              Connect Stripe
            </Button>
          )}
        </div>
      </PremiumCard>

      <section>
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-[0.18em] text-ink-400">
            Recent transactions
          </h2>
          <Button type="button" variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export CSV
          </Button>
        </header>
        <div className="overflow-x-auto rounded-2xl border border-ink-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-ink-900/60 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Athlete</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Coach net</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((row) => (
                <tr key={row.id} className="border-t border-ink-800/80">
                  <td className="px-4 py-3 text-ink-100">{row.athleteName}</td>
                  <td className="px-4 py-3 text-ink-400">{row.sessionType}</td>
                  <td className="px-4 py-3 text-ink-400">{row.date}</td>
                  <td className="px-4 py-3 font-medium text-ink-100">
                    {formatEur(row.coachShareCents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.status === "paid"
                          ? "text-accent-400"
                          : "text-amber-400"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
