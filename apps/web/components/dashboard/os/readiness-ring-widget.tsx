"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ReadinessRing } from "@/components/ui-glass/readiness-ring";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type ReadinessRingWidgetProps = {
  readiness: number;
  className?: string;
};

export function ReadinessRingWidget({ readiness, className }: ReadinessRingWidgetProps) {
  const { dashboard } = useLocale();
  const copy = dashboard.readiness_ring;
  const band =
    readiness >= 75
      ? dashboard.readinessGreen
      : readiness >= 50
        ? dashboard.os.trainSmart.replace(".", "")
        : dashboard.sleepRecovery;

  return (
    <div
      className={cn(
        "eos-bento-card relative border border-white/5 p-5 bg-[var(--eos-glass-bg)] backdrop-blur-[var(--eos-glass-blur)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.18)_0%,transparent_70%)] motion-safe:animate-pulse"
      />
      <div className="relative flex items-center gap-5">
        <div className="relative shrink-0">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--eos-voltline),var(--volt-600),var(--eos-voltline))] opacity-30 motion-safe:animate-spin [animation-duration:8s]"
          />
          <ReadinessRing
            percent={readiness}
            label={copy.title}
            size={112}
            className="relative motion-safe:animate-[pulse_3s_ease-in-out_infinite]"
            data-testid="readiness-ring-widget"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eos-label-caps text-eos-on-surface-subtle">
            {copy.subtitle}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-eos-on-surface">{readiness}%</p>
          <p className="mt-1 text-sm text-eos-voltline">{band}</p>
          <Link
            href="/settings/wearables"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-eos-on-surface-muted transition hover:text-eos-voltline"
          >
            {copy.viewDetails}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
