"use client";

import {
  ArrowRight,
  Brain,
  HeartHandshake,
  HeartPulse,
  Moon,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n-provider";
import { RoleDashboardPreview } from "@/components/dashboard/role-dashboard-preview";
import {
  AIInsight,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";

export function DashboardPreview() {
  const locale = useLocale();
  const features = [
    {
      icon: HeartPulse,
      color: "text-signal-400",
      title: locale.dashboardPreview.features[0]?.title ?? "",
      body: locale.dashboardPreview.features[0]?.body ?? ""
    },
    {
      icon: Brain,
      color: "text-cyan-500",
      title: locale.dashboardPreview.features[1]?.title ?? "",
      body: locale.dashboardPreview.features[1]?.body ?? ""
    },
    {
      icon: Moon,
      color: "text-brand-400",
      title: locale.dashboardPreview.features[2]?.title ?? "",
      body: locale.dashboardPreview.features[2]?.body ?? ""
    },
    {
      icon: TrendingUp,
      color: "text-volt-500",
      title: locale.dashboardPreview.features[3]?.title ?? "",
      body: locale.dashboardPreview.features[3]?.body ?? ""
    }
  ];

  return (
    <section
      id="dashboard-preview"
      aria-labelledby="fc-dashboard-preview-title"
      className="relative isolate z-10 mx-auto max-w-7xl fc-section-x px-4 py-16 sm:px-6 sm:py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-x-4 top-16 -z-10 h-[480px] rounded-3xl bg-radial-fade sm:inset-x-6" />

      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8 xl:gap-x-16">
        <div className="relative z-10 min-w-0 lg:col-span-5 lg:order-1">
          <SectionHeader
            titleId="fc-dashboard-preview-title"
            eyebrow={locale.dashboardPreview.eyebrow}
            title={
              <>
                {locale.dashboardPreview.title}{" "}
                <span className="gradient-text">
                  {locale.dashboardPreview.titleAccent}
                </span>
              </>
            }
            body={locale.dashboardPreview.subtitle}
            action={<RealtimeBadge>AI live</RealtimeBadge>}
          />
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f.title}>
                <PremiumCard className="flex items-start gap-3 p-3">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-900 ring-1 ring-ink-800 ${f.color}`}
                  >
                    <f.icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-100">{f.title}</p>
                    <p className="text-sm text-ink-400">{f.body}</p>
                  </div>
                </PremiumCard>
              </li>
            ))}
          </ul>
          <AIInsight
            className="mt-5"
            title="One shared language for athletes and coaches"
            body="The same readiness, strain, sleep and AI recommendation model appears in preview, app and live dashboard routes."
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 font-semibold"
            >
              {locale.dashboardPreview.athleteCta}{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/coach/dashboard"
              className="inline-flex items-center gap-2 text-ink-300 hover:text-ink-100 font-semibold"
            >
              <HeartHandshake className="h-4 w-4" aria-hidden />
              {locale.dashboardPreview.coachCta}
            </Link>
          </div>
        </div>

        <div className="relative z-10 min-w-0 lg:col-span-7 lg:order-2">
          <div className="flex flex-col items-center gap-4 lg:items-end">
            <RoleDashboardPreview compact />

            <div className="hidden w-full max-w-[300px] items-center gap-3 rounded-2xl border border-ink-800/80 bg-ink-950/80 p-3 shadow-elevated backdrop-blur-sm sm:max-w-[320px] md:flex lg:self-end">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
                <TrendingUp className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 text-xs">
                <p className="font-semibold text-ink-100">
                  {locale.dashboardPreview.floatingTitle}
                </p>
                <p className="text-ink-400">{locale.dashboardPreview.floatingBody}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
