"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  HeartHandshake,
  HeartPulse,
  Moon,
  Sparkles,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n-provider";
import { RoleDashboardPreview } from "@/components/dashboard/role-dashboard-preview";
import { useInViewEntrance } from "@/lib/use-entrance-motion";
import {
  AIInsight,
  PremiumCard,
  RealtimeBadge,
  SectionHeader
} from "@/components/ui-glass/premium-system";

export function DashboardPreview() {
  const locale = useLocale();
  const entrance = useInViewEntrance(24);
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
      className="relative mx-auto max-w-7xl px-6 py-20 md:py-28"
    >
      <div className="absolute inset-x-6 top-12 -z-10 h-[520px] rounded-3xl bg-radial-fade" />
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <SectionHeader
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
          <ul className="mt-8 space-y-4">
            {features.map((f) => (
              <li key={f.title}>
                <PremiumCard className="flex items-start gap-3 p-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-lg bg-ink-900 ring-1 ring-ink-800 ${f.color}`}
                  >
                    <f.icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
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

        <motion.div
          {...entrance}
          className="lg:col-span-7 order-1 lg:order-2 relative"
        >
          <RoleDashboardPreview />
          <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 rounded-2xl glass p-4 shadow-elevated pointer-events-none">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-500/10 text-accent-400">
              <TrendingUp className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-xs">
              <p className="text-ink-100 font-semibold">
                {locale.dashboardPreview.floatingTitle}
              </p>
              <p className="text-ink-400">{locale.dashboardPreview.floatingBody}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
