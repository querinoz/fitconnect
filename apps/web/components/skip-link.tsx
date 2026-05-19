"use client";

import { useT } from "@/lib/i18n-provider";

export function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-ink-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink-50 focus:ring-2 focus:ring-brand-400/80 focus:shadow-glow"
    >
      {t("common", "skipToContent")}
    </a>
  );
}
