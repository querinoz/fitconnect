"use client";

import Link from "next/link";
import { Smartphone, Download } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";
import { EliteButton } from "@/components/elite-os";
import { LabelCaps, Headline, BodyText } from "@/components/elite-os/typography";
import { useLocale } from "@/lib/i18n-provider";

export function DownloadSection() {
  const { canInstall, prompt } = useInstallPrompt();
  const d = useLocale().downloadSection;

  return (
    <section className="fc-section-x border-t border-eos-outline py-16 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-[var(--eos-radius-modal)] border border-eos-voltline/20 bg-gradient-to-br from-eos-voltline-dim via-eos-floor to-eos-iris-glow/10 p-8 text-center sm:p-12 eos-inner-stroke">
        <LabelCaps className="text-eos-voltline">{d.eyebrow}</LabelCaps>
        <Headline className="mt-3 text-2xl sm:text-3xl">{d.title}</Headline>
        <BodyText className="mx-auto mt-3 max-w-lg text-sm">{d.subtitle}</BodyText>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {canInstall ? (
            <EliteButton type="button" className="gap-2" onClick={() => void prompt()}>
              <Download className="h-4 w-4" />
              {d.installApp}
            </EliteButton>
          ) : (
            <EliteButton asChild variant="primary" className="gap-2">
              <Link href="/mobile">
                <Smartphone className="h-4 w-4" />
                {d.openLiveDemo}
              </Link>
            </EliteButton>
          )}
          <EliteButton asChild variant="secondary">
            <Link href="/mobile">{d.tryMobileDemo}</Link>
          </EliteButton>
        </div>
      </div>
    </section>
  );
}
