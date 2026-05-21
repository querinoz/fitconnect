"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

const FitConnectMap = dynamic(
  () => import("@/components/map/fit-connect-map").then((m) => m.FitConnectMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] animate-pulse rounded-2xl border border-ink-800 bg-ink-900/40" />
    )
  }
);

type MapWidgetProps = {
  className?: string;
};

export function MapWidget({ className }: MapWidgetProps) {
  const { dashboard } = useLocale();
  const copy = dashboard.map;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-ink-800 px-5 py-4">
        <div>
          <h3 className="font-display text-sm font-bold text-ink-100">{copy.title}</h3>
          <p className="mt-0.5 text-xs text-ink-500">{copy.subtitle}</p>
        </div>
        <Link
          href="/map"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-volt-400 hover:text-volt-300"
        >
          <MapPin className="h-3.5 w-3.5" />
          {copy.viewFull}
        </Link>
      </div>
      <div className="p-3 pt-0">
        <FitConnectMap
          mode="athlete"
          height={240}
          className="rounded-xl border-ink-700/80"
        />
      </div>
    </div>
  );
}
