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
        "relative overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40 p-5",
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
            className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--volt-500),var(--lime-500),var(--volt-500))] opacity-30 motion-safe:animate-spin [animation-duration:8s]"
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
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            {copy.subtitle}
          </p>
          <p className="mt-1 font-display text-lg font-bold text-ink-50">{readiness}%</p>
          <p className="mt-1 text-sm text-volt-400">{band}</p>
          <Link
            href="/settings/wearables"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-400 transition hover:text-volt-400"
          >
            {copy.viewDetails}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
