"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { TrendingUp } from "lucide-react";
import { rechartsTheme } from "@/lib/charts/recharts-theme";

const EARNINGS_DATA = [
  { month: "Oct", earnings: 2200, sessions: 32 },
  { month: "Nov", earnings: 2800, sessions: 41 },
  { month: "Dec", earnings: 3100, sessions: 45 },
  { month: "Jan", earnings: 3400, sessions: 48 },
  { month: "Feb", earnings: 3900, sessions: 56 },
  { month: "Mar", earnings: 4280, sessions: 62 },
  { month: "Apr", earnings: 4520, sessions: 65 },
  { month: "May", earnings: 4810, sessions: 69 }
];

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-3 shadow-xl">
      <p className="mb-1.5 text-[10px] text-ink-500">{label}</p>
      <p className="text-sm font-bold text-lime-400">
        €{payload[0]!.value.toLocaleString()}
      </p>
      <p className="mt-0.5 text-[10px] text-ink-500">
        Take-home: €{Math.round(payload[0]!.value * 0.85).toLocaleString()}
      </p>
    </div>
  );
}

export function EarningsChart() {
  const current = EARNINGS_DATA[EARNINGS_DATA.length - 1]!;
  const prev = EARNINGS_DATA[EARNINGS_DATA.length - 2]!;
  const growth = (((current.earnings - prev.earnings) / prev.earnings) * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-500">
            Monthly Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-ink-50">
              €{current.earnings.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-lime-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-sm font-bold">+{growth}%</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-ink-500">Take-home</p>
          <p className="font-display text-xl font-bold text-lime-400">
            €{Math.round(current.earnings * 0.85).toLocaleString()}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-500">85% of gross</p>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={EARNINGS_DATA} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="earnGradCoach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={rechartsTheme.earnings} stopOpacity={0.3} />
                <stop offset="100%" stopColor={rechartsTheme.earnings} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={rechartsTheme.grid} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: rechartsTheme.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: rechartsTheme.axis }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke={rechartsTheme.earnings}
              fill="url(#earnGradCoach)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: rechartsTheme.earnings, stroke: rechartsTheme.ink, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-800/60 pt-4">
        {[
          { label: "Sessions", val: String(current.sessions) },
          { label: "Avg / session", val: `€${Math.round(current.earnings / current.sessions)}` },
          {
            label: "YTD revenue",
            val: `€${EARNINGS_DATA.reduce((s, d) => s + d.earnings, 0).toLocaleString()}`
          }
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-sm font-bold text-ink-100">{s.val}</p>
            <p className="text-[10px] text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
