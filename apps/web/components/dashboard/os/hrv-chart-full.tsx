"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { generateHrvSeries } from "@/lib/readiness/compute";

const RANGES = [
  { label: "7d", count: 7 },
  { label: "14d", count: 14 },
  { label: "30d", count: 30 }
];

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-xl border border-ink-700 bg-ink-900 p-3 shadow-xl">
      <p className="text-[10px] text-ink-500">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
          {p.dataKey === "hrv" ? " ms" : " h"}
        </p>
      ))}
    </div>
  );
}

export function HrvChartFull({ baselineHrv, seed = 1 }: { baselineHrv: number; seed?: number }) {
  const [range, setRange] = useState(14);
  const full = useMemo(
    () =>
      generateHrvSeries(30, baselineHrv, seed).map((d) => ({
        date: d.day,
        hrv: d.hrv,
        sleep: d.sleep
      })),
    [baselineHrv, seed]
  );
  const data = full.slice(-range);
  const avg = Math.round(data.reduce((s, d) => s + d.hrv, 0) / data.length);

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-500">
            HRV × Sleep correlation
          </p>
          <p className="font-display text-base font-bold text-ink-100">Recovery trend</p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRange(r.count)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                range === r.count
                  ? "bg-ink-800 text-ink-200"
                  : "text-ink-600 hover:text-ink-400"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-5 text-[10px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-brand-400" />
          HRV (ms)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-plasma-500" />
          Sleep (h)
        </span>
        <span className="ml-auto">avg {avg} ms</span>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="hrvFullOs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ddb4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00ddb4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sleepFullOs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="hrv"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 4", "dataMax + 4"]}
            />
            <YAxis
              yAxisId="sleep"
              orientation="right"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={[5, 10]}
            />
            <ReferenceLine
              yAxisId="hrv"
              y={avg}
              stroke="#00ddb4"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="hrv"
              type="monotone"
              dataKey="hrv"
              stroke="#00ddb4"
              fill="url(#hrvFullOs)"
              strokeWidth={2}
              dot={false}
              name="HRV"
              activeDot={{ r: 4, fill: "#00ddb4", stroke: "#0f172a", strokeWidth: 2 }}
            />
            <Area
              yAxisId="sleep"
              type="monotone"
              dataKey="sleep"
              stroke="#a855f7"
              fill="url(#sleepFullOs)"
              strokeWidth={2}
              dot={false}
              name="Sleep"
              activeDot={{ r: 4, fill: "#a855f7", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
