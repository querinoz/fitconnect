import { AlertTriangle, ChevronRight, Moon, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import { BodyText, LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

const INSIGHTS = [
  {
    icon: TrendingUp,
    accent: "border-eos-voltline",
    title: "Optimal training window",
    text: "HRV is +4 ms above 30-day average. Today is ideal for high-intensity work.",
    action: "View plan",
    href: "/dashboard"
  },
  {
    icon: Moon,
    accent: "border-eos-telemetry",
    title: "Sleep trend improving",
    text: "Sleep quality up 12% this week vs last. Deep sleep duration increased by 18 min.",
    action: null,
    href: null
  },
  {
    icon: AlertTriangle,
    accent: "border-eos-recovery",
    title: "Load management alert",
    text: "Cumulative training load is trending high. Coach recommends a deload block next week.",
    action: "See plan",
    href: "/dashboard"
  }
] as const;

export function AiInsightsPanel() {
  return (
    <BentoCard
      elevation="glass"
      padding="md"
      label={
        <span className="inline-flex items-center gap-2 text-eos-iris-soft">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          AI Insights
        </span>
      }
    >
      <div className="space-y-3">
        {INSIGHTS.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.title}
              className={cn(
                "rounded-[var(--eos-radius-nested)] border-l-2 bg-eos-elevated/90 p-3.5",
                insight.accent
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-eos-on-surface-muted" />
                <div className="min-w-0">
                  <LabelCaps className="text-eos-on-surface">{insight.title}</LabelCaps>
                  <BodyText className="mt-1 text-xs">{insight.text}</BodyText>
                  {insight.action && insight.href ? (
                    <Link
                      href={insight.href}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-eos-voltline hover:opacity-80"
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
      <EliteButton className="mt-4 w-full" size="sm">
        Generate daily plan
      </EliteButton>
    </BentoCard>
  );
}
