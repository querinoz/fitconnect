"use client";

import { AuthGate } from "@/components/auth-gate";
import { FitConnectMap } from "@/components/map/fit-connect-map";
import { useLocale } from "@/lib/i18n-provider";

function MapPageBody() {
  const { dashboard, hub } = useLocale();

  return (
    <div className="space-y-4 pb-6 pt-2">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-volt-400">
          {hub.map.title}
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-ink-50">
          {dashboard.map.title}
        </h1>
        <p className="mt-1 text-sm text-ink-400">{dashboard.map.subtitle}</p>
      </header>
      <FitConnectMap mode="athlete" height="min(70vh, 560px)" className="rounded-2xl" />
    </div>
  );
}

export default function MapPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <MapPageBody />
    </AuthGate>
  );
}
