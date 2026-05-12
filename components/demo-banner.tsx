"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n-provider";

export function DemoBanner() {
  const t = useT();
  return (
    <div
      role="region"
      aria-label={t("demo", "label")}
      className="relative isolate w-full border-b border-brand-400/20 bg-gradient-to-r from-brand-500/10 via-plasma-500/8 to-accent-500/10"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-xs">
        <p className="flex items-center gap-2 text-ink-200">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-2 py-0.5 font-bold uppercase tracking-wider text-brand-100 ring-1 ring-brand-400/40">
            <Sparkles className="h-3 w-3" />
            {t("demo", "label")}
          </span>
          <span className="text-ink-300">{t("demo", "body")}</span>
        </p>
        <Link
          href="https://github.com/querinoz/fitconnect"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-ink-800 bg-ink-950/60 px-2.5 py-0.5 font-semibold text-ink-100 hover:border-brand-400/50 hover:text-brand-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          {t("demo", "cta")}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
