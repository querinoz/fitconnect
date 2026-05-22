"use client";

import { AuthGate } from "@/components/auth-gate";
import { FitConnectMap } from "@/components/map/fit-connect-map";
import { EliteAppPage } from "@/components/shell/elite";
import { useLocale } from "@/lib/i18n-provider";

function MapPageBody() {
  const { dashboard, hub } = useLocale();

  return (
    <EliteAppPage
      eyebrow={hub.map.title}
      title={dashboard.map.title}
      subtitle={dashboard.map.subtitle}
    >
      <FitConnectMap
        mode="athlete"
        height="min(70vh, 560px)"
        className="overflow-hidden rounded-[var(--eos-radius-card)] border border-eos-outline"
      />
    </EliteAppPage>
  );
}

export default function MapPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <MapPageBody />
    </AuthGate>
  );
}
