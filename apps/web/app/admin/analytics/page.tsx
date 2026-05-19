"use client";

import { getAdminFunnel } from "@/lib/admin/kpis";

export default function AdminAnalyticsPage() {
  const funnel = getAdminFunnel();

  return (
    <>
      <h1 className="font-display text-3xl font-bold">Product analytics</h1>
      <p className="mt-2 text-sm text-ink-400">Signup → onboarding → intro → paid funnel</p>
      <div className="mt-8 space-y-4">
        {funnel.map((step) => (
          <article key={step.label} className="rounded-2xl border border-ink-800 bg-ink-950/60 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-semibold text-ink-100">{step.label}</p>
              <p className="text-sm text-ink-400">{step.count.toLocaleString()} users</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-ink-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-accent-500"
                style={{ width: `${Math.round(step.rate * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-500">{Math.round(step.rate * 100)}% of signup</p>
          </article>
        ))}
      </div>
    </>
  );
}
