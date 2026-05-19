import { AlertTriangle, ChevronRight, Moon, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const INSIGHTS = [
  {
    icon: TrendingUp,
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    title: "Optimal training window",
    text: "HRV is +4 ms above 30-day average. Today is ideal for high-intensity work. Coach adjusted your Thursday session to zone 4 intervals.",
    action: "View plan",
    href: "/dashboard"
  },
  {
    icon: Moon,
    color: "text-plasma-500",
    bg: "bg-plasma-500/10",
    border: "border-plasma-500/20",
    title: "Sleep trend improving",
    text: "Sleep quality up 12% this week vs last. Deep sleep duration increased by 18 min on average.",
    action: null,
    href: null
  },
  {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    title: "Load management alert",
    text: "Cumulative training load is trending high. Coach recommends a deload block next week.",
    action: "See plan",
    href: "/dashboard"
  }
];

export function AiInsightsPanel() {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-plasma-500/20">
          <Sparkles className="h-3.5 w-3.5 text-plasma-500" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold text-ink-100">AI Coach Insights</h3>
          <p className="text-[10px] text-ink-500">Coach-approved · Updated now</p>
        </div>
      </div>

      <div className="space-y-3">
        {INSIGHTS.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className={`rounded-xl border ${insight.border} ${insight.bg} p-3.5`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-950/40">
                  <Icon className={`h-3.5 w-3.5 ${insight.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${insight.color}`}
                  >
                    {insight.title}
                  </p>
                  <p className="text-xs leading-relaxed text-ink-400">{insight.text}</p>
                  {insight.action && insight.href ? (
                    <Link
                      href={insight.href}
                      className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${insight.color} hover:opacity-80`}
                    >
                      {insight.action} <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
