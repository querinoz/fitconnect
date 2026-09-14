"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { EliteAppPage } from "@/components/shell/elite";
import { BentoCard, EliteButton } from "@/components/elite-os";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { useAuthStore } from "@/lib/auth-store";
import { resolveDashboardAthleteId } from "@/lib/dashboard/resolve-scope";
import { trackEvent } from "@/lib/observability/posthog";
import type { WearableProvider } from "@fitconnect/types";
import {
  resolveProviderConnectAction,
  type ProviderConnectAction
} from "@/lib/integrations/provider-connect";
import { Activity, Check, ExternalLink, Link2, Smartphone, Watch } from "lucide-react";

type ProviderRow = {
  id: WearableProvider;
  label: string;
  status: string;
  oauth: boolean;
  configured: boolean;
  lastSyncAt: string | null;
};

function actionCopy(action: ProviderConnectAction): { cta: string; hint: string } {
  switch (action.kind) {
    case "strava_oauth":
      return { cta: "Connect Strava", hint: "Opens official Strava OAuth. Activities stay private to you." };
    case "strava_disconnect":
      return { cta: "Disconnect", hint: "Revokes FitConnect access. Strava data never appears in Feed." };
    case "health_connect":
      return {
        cta: "Open Android app",
        hint: "Health Connect permissions are granted on Android, not in this browser."
      };
    case "apple_health":
      return {
        cta: "Requires iPhone",
        hint: "Apple Health / HealthKit is available in the iOS app on macOS/iPhone."
      };
    case "oauth_not_configured":
      return {
        cta: "Not configured",
        hint: "This environment has no partner credentials. We will not fake a connection."
      };
    case "oauth_not_live":
      return {
        cta: "OAuth not live",
        hint: "Partner approval is still required. Connect will not pretend to succeed."
      };
  }
}

export default function WearablesSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const athleteId = resolveDashboardAthleteId(user);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<WearableProvider | null>(null);

  const load = useCallback(async () => {
    if (!athleteId) {
      setLoading(false);
      return;
    }
    setError(null);
    const res = await fetch(
      `/api/v1/integrations/status?athleteId=${encodeURIComponent(athleteId)}`
    );
    if (!res.ok) {
      setProviders([]);
      setError(res.status === 401 ? "Sign in to see device status." : "Could not load integrations.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { providers: ProviderRow[] };
    setProviders(data.providers ?? []);
    setLoading(false);
  }, [athleteId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(p: ProviderRow) {
    const action = resolveProviderConnectAction(p);
    trackEvent("wearable_connect", { provider: p.id, action: action.kind });
    if (action.kind === "strava_oauth") {
      window.location.href = `/api/v1/integrations/strava/connect?athleteId=${encodeURIComponent(athleteId)}`;
      return;
    }
    if (action.kind === "strava_disconnect") {
      setBusy(p.id);
      const res = await fetch("/api/v1/integrations/strava/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId })
      });
      setBusy(null);
      if (!res.ok) {
        setError("Disconnect failed. Try again.");
        return;
      }
      await load();
    }
  }

  return (
    <AuthGate roles={["athlete", "coach", "admin"]}>
      <EliteAppPage
        eyebrow="Recovery"
        title="Wearables & APIs"
        subtitle="Connect real providers. Missing credentials stay disconnected — we never invent a sync."
      >
        {loading ? (
          <p className="text-sm text-eos-on-surface-muted">Loading device status…</p>
        ) : null}
        {error ? (
          <p className="text-sm text-eos-alert" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="grid gap-3 sm:grid-cols-2">
          {providers.map((p) => {
            const isConnected = p.status === "connected";
            const action = resolveProviderConnectAction(p);
            const copy = actionCopy(action);
            const canRun = action.kind === "strava_oauth" || action.kind === "strava_disconnect";
            return (
              <li key={p.id}>
                <BentoCard elevation="1" className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-eos-voltline" aria-hidden />
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
                      <EliteChip tone="neutral" as="span" className="text-[10px]">
                        Disconnected
                      </EliteChip>
                    )}
                  </div>
                  <p className="text-xs text-eos-on-surface-muted">{copy.hint}</p>
                  {p.lastSyncAt ? (
                    <p className="text-[10px] uppercase tracking-wider text-eos-on-surface-subtle">
                      Last sync {new Date(p.lastSyncAt).toLocaleString()}
                    </p>
                  ) : null}
                  {action.kind === "health_connect" ? (
                    <EliteButton asChild variant="secondary" size="sm">
                      <Link href="/mobile">
                        <Smartphone className="h-3.5 w-3.5" aria-hidden />
                        {copy.cta}
                      </Link>
                    </EliteButton>
                  ) : action.kind === "apple_health" ? (
                    <EliteButton asChild variant="secondary" size="sm">
                      <Link href="/mobile">
                        <Watch className="h-3.5 w-3.5" aria-hidden />
                        {copy.cta}
                      </Link>
                    </EliteButton>
                  ) : (
                    <EliteButton
                      type="button"
                      variant={canRun ? "secondary" : "ghost"}
                      size="sm"
                      disabled={!canRun || busy === p.id}
                      onClick={() => void runAction(p)}
                    >
                      <Link2 className="h-3.5 w-3.5" aria-hidden />
                      {busy === p.id ? "Working…" : copy.cta}
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
