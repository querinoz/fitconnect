"use client";

import Link from "next/link";
import { Smartphone, Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { useLocale } from "@/lib/i18n-provider";

export function DownloadSection() {
  const { canInstall, prompt } = useInstallPrompt();
  const d = useLocale().downloadSection;

  return (
    <section className="fc-section-x border-t border-ink-800/60 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-3xl border border-volt-500/20 bg-gradient-to-br from-volt-500/10 via-ink-950 to-brand-500/10 p-8 text-center sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-volt-500">{d.eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-ink-50 sm:text-3xl">
          {d.title}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-400">{d.subtitle}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {canInstall ? (
            <VoltButton type="button" className="gap-2" onClick={() => void prompt()}>
              <Download className="h-4 w-4" />
              {d.installApp}
            </VoltButton>
          ) : (
            <VoltButton asChild className="gap-2">
              <Link href="/mobile">
                <Smartphone className="h-4 w-4" />
                {d.openLiveDemo}
              </Link>
            </VoltButton>
          )}
          <VoltButton asChild variant="subtle">
            <Link href="/mobile">{d.tryMobileDemo}</Link>
          </VoltButton>
        </div>
      </div>
    </section>
  );
}
