import { BentoCard } from "@/components/elite-os";
import { loadAdminFunnel } from "@/lib/admin/kpis";
import { EliteAppPage } from "@/components/shell/elite";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const funnel = await loadAdminFunnel();
  const hasEvents = funnel.some((step) => step.count > 0);

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Product analytics"
      subtitle={
        hasEvents
          ? "First-party event counts from analytics_events"
          : "No first-party events recorded yet"
      }
    >
      <div className="space-y-4">
        {funnel.map((step) => (
          <BentoCard key={step.label} elevation="1">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-ink-100">{step.label}</p>
              <p className="text-sm text-eos-on-surface-muted">{step.count} events</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-eos-surface-container">
              <div
                className="h-full bg-gradient-to-r from-eos-iris to-eos-voltline"
                style={{ width: `${Math.round(step.rate * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-eos-on-surface-muted">
              {Math.round(step.rate * 100)}% of signup
            </p>
          </BentoCard>
        ))}
      </div>
    </EliteAppPage>
  );
}
