"use client";

import { AuthGate } from "@/components/auth-gate";
import { SportsIntelligenceMap } from "@/components/map/sports-intelligence-map";
import { EliteAppPage } from "@/components/shell/elite";
import { useLocale } from "@/lib/i18n-provider";

function MapPageBody() {
  const { dashboard, hub } = useLocale();

  return (
    <EliteAppPage
      eyebrow={hub.map.title}
      title="Sports Intelligence Map"
      subtitle={dashboard.map.subtitle}
    >
      <SportsIntelligenceMap height="min(72vh, 640px)" />
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
