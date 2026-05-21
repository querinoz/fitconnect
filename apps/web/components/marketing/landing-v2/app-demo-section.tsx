"use client";

import dynamic from "next/dynamic";
import { HeroDeviceGate } from "@/components/marketing/hero-device-gate";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useLocale } from "@/lib/i18n-provider";

const MobileAppPreview = dynamic(
  () =>
    import("@/components/dashboard/mobile-app-preview").then((m) => m.MobileAppPreview),
  { ssr: false, loading: () => <div className="mx-auto h-[640px] max-w-sm skeleton rounded-[2rem]" /> }
);

/** Section 9 — device gate + interactive mobile app preview. */
export function AppDemoSection() {
  const locale = useLocale();
  const d = locale.dashboardPreview;

  return (
    <section className="landing-v2-section nivis-section-grid mx-auto max-w-7xl fc-section-x px-4 py-20 sm:px-6 sm:py-28">
      <SectionHeader
        eyebrow={d.eyebrow}
        title={d.title}
        body={d.subtitle}
        className="max-w-2xl"
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        <HeroDeviceGate className="mx-auto w-full max-w-md lg:max-w-none" />
        <MobileAppPreview />
      </div>
    </section>
  );
}
