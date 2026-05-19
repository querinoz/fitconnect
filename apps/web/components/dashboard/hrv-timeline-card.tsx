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
import { rechartsTheme } from "@/lib/charts/recharts-theme";
import type { generateHrvSeries } from "@/lib/readiness/compute";

type HrvTimelineCardProps = {
  series: ReturnType<typeof generateHrvSeries>;
};

const tooltipStyle = {
  background: rechartsTheme.tooltipBg,
  border: `1px solid ${rechartsTheme.tooltipBorder}`,
  borderRadius: "12px"
};

export function HrvTimelineCard({ series }: HrvTimelineCardProps) {
  return (
    <ChartShell title="HRV timeline" subtitle="Last 30 days · Apple Watch">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid stroke={rechartsTheme.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: rechartsTheme.axis, fontSize: 10 }}
              interval={4}
            />
            <YAxis
              domain={[40, 80]}
              tick={{ fill: rechartsTheme.axis, fontSize: 10 }}
              width={32}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="hrv"
              stroke={rechartsTheme.baseline}
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
