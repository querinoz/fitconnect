"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartShell } from "@/components/ui-glass/premium-system";
import type { generateHrvSeries } from "@/lib/readiness/compute";

type HrvTimelineCardProps = {
  series: ReturnType<typeof generateHrvSeries>;
};

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "12px"
};

export function HrvTimelineCard({ series }: HrvTimelineCardProps) {
  return (
    <ChartShell title="HRV timeline" subtitle="Last 30 days · Apple Watch">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              interval={4}
            />
            <YAxis
              domain={[40, 80]}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              width={32}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="hrv"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              name="HRV (ms)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
