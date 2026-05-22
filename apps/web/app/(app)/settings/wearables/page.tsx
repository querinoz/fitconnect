"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { EliteAppPage } from "@/components/shell/elite";
import { BentoCard, EliteButton } from "@/components/elite-os";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import { trackEvent } from "@/lib/observability/posthog";
import type { WearableProvider } from "@fitconnect/types";
import { Activity, Check, ExternalLink, Link2 } from "lucide-react";

const PROVIDERS: { id: WearableProvider; label: string; envKey: string }[] = [
  { id: "strava", label: "Strava", envKey: "STRAVA_CLIENT_ID" },
  { id: "whoop", label: "Whoop", envKey: "WHOOP_CLIENT_ID" },
  { id: "oura", label: "Oura", envKey: "OURA_CLIENT_ID" },
  { id: "garmin", label: "Garmin", envKey: "GARMIN_CONSUMER_KEY" },
  { id: "apple_health", label: "Apple Health", envKey: "" },
  { id: "health_connect", label: "Health Connect", envKey: "" }
];

export default function WearablesSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const [connected, setConnected] = useState<WearableProvider[]>([]);

  useEffect(() => {
    void fetch(`/api/v1/integrations/status?athleteId=${encodeURIComponent(athleteId)}`)
      .then((r) => r.json())
      .then((data: { providers: { id: WearableProvider; status: string }[] }) => {
        setConnected(
          data.providers.filter((p) => p.status === "connected").map((p) => p.id)
        );
      });
  }, [athleteId]);

  function connect(id: WearableProvider) {
    trackEvent("wearable_connect", { provider: id });
    if (id === "strava") {
      window.location.href = `/api/v1/integrations/strava/connect?athleteId=${encodeURIComponent(athleteId)}`;
      return;
    }
    setConnected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <AuthGate roles={["athlete", "coach", "admin"]}>
      <EliteAppPage
        eyebrow="Recovery"
        title="Wearables & APIs"
        subtitle="Connect Strava, Whoop, Oura and more. Status syncs to your dashboard API monitor."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const isConnected = connected.includes(p.id);
            return (
              <li key={p.id}>
                <BentoCard elevation="1" className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-eos-voltline" />
                    <div>
                      <p className="font-semibold text-ink-50">{p.label}</p>
                      <p className="text-xs text-ink-400 capitalize">{p.id.replace("_", " ")}</p>
                    </div>
                  </div>
                  {isConnected ? (
                    <EliteChip tone="performance" as="span" className="text-[10px]">
                      <Check className="mr-1 inline h-3 w-3" /> Connected
                    </EliteChip>
                  ) : (
                    <EliteButton type="button" variant="secondary" size="sm" onClick={() => connect(p.id)}>
                      <Link2 className="h-3.5 w-3.5" /> Connect
                    </EliteButton>
                  )}
                </BentoCard>
              </li>
            );
          })}
        </ul>
        <BentoCard elevation="glass" className="mt-2">
          <p className="text-sm text-ink-300">
            Strava OAuth uses scopes:{" "}
            <code className="text-eos-voltline">read, activity:read, activity:read_all, profile:read_all</code>
          </p>
          <Link
            href="https://developers.strava.com/docs/reference/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-eos-iris-soft"
          >
            Strava API reference
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </BentoCard>
      </EliteAppPage>
    </AuthGate>
  );
}
