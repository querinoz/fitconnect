"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";
import { SectionHeader } from "@/components/ui-glass/premium-system";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import { trackEvent } from "@/lib/observability/posthog";
import type { WearableProvider } from "@fitconnect/types";
import { Activity, Check, ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <SectionHeader
        eyebrow="Recovery"
        title="Wearables & APIs"
        body="Connect Strava, Whoop, Oura and more. Status syncs to your dashboard API monitor."
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => {
          const isConnected = connected.includes(p.id);
          return (
            <li key={p.id}>
              <GlassCard className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-volt-400" />
                  <div>
                    <p className="font-semibold text-ink-50">{p.label}</p>
                    <p className="text-xs text-ink-400 capitalize">{p.id.replace("_", " ")}</p>
                  </div>
                </div>
                {isConnected ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-300">
                    <Check className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => connect(p.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition fc-liquid-btn",
                      "bg-glass-md text-ink-100 border border-glass-border hover:border-volt-500/30"
                    )}
                  >
                    <Link2 className="h-3.5 w-3.5" /> Connect
                  </button>
                )}
              </GlassCard>
            </li>
          );
        })}
      </ul>
      <GlassCard className="mt-6 p-4">
        <p className="text-sm text-ink-300">
          Strava OAuth uses scopes: <code className="text-volt-300">read, activity:read, activity:read_all, profile:read_all</code>
        </p>
        <Link
          href="https://developers.strava.com/docs/reference/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-300"
        >
          Strava API reference
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </GlassCard>
    </AuthGate>
  );
}
