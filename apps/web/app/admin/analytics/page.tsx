"use client";

import { BentoCard } from "@/components/elite-os";
import { getAdminFunnel } from "@/lib/admin/kpis";
import { EliteAppPage } from "@/components/shell/elite";

export default function AdminAnalyticsPage() {
  const funnel = getAdminFunnel();

  return (
    <EliteAppPage
      eyebrow="Admin"
      title="Product analytics"
      subtitle="Signup → onboarding → intro → paid funnel"
    >
      <div className="space-y-4">
        {funnel.map((step) => (
          <BentoCard key={step.label} elevation="1">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-ink-100">{step.label}</p>
              <p className="text-sm text-eos-on-surface-muted">
                {step.count.toLocaleString()} users
              </p>
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
