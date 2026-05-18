"use client";

import Link from "next/link";
import { ArrowLeft, HeartPulse, MessageSquare } from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { CoachPlanPanel } from "./coach-plan-panel";
import { ReadinessCard } from "./readiness-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n-provider";
import { useAthleteContext } from "@/lib/use-dashboard-context";
import { useDashboardStore } from "@/lib/dashboard-store";

type Props = { athleteId: string; wrapShell?: boolean };

export function CoachAthleteDetailView({ athleteId, wrapShell = true }: Props) {
  const t = useT();
  const ctx = useAthleteContext(athleteId);
  const updatePlanSuggestion = useDashboardStore((s) => s.updatePlanSuggestion);

  if (!ctx.athlete) {
    const fallback = (
      <>
        <p className="text-ink-400">{t("hub", "athleteNotFound")}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/coach/dashboard">{t("hub", "backToRoster")}</Link>
        </Button>
      </>
    );
    return wrapShell ? <DashboardShell>{fallback}</DashboardShell> : fallback;
  }

  const { athlete, plan, messages } = ctx;

  const body = (
    <>
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 min-h-[44px]">
          <Link href="/coach/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("hub", "backToRoster")}
          </Link>
        </Button>

        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={athlete.avatar}
              alt=""
              className="h-14 w-14 rounded-2xl ring-2 ring-ink-800 object-cover"
            />
            <div>
              <p className="eyebrow">{t("hub", "monitorAthlete")}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-50">
                {athlete.name}
              </h1>
              <p className="text-sm text-ink-400">{athlete.sports.join(" · ")}</p>
            </div>
          </div>
          <Badge
            className={
              athlete.recoveryStatus === "green"
                ? "bg-accent-500/10 text-accent-300"
                : "bg-amber-500/10 text-amber-300"
            }
          >
            {t("hub", "readiness")} {athlete.readiness}
          </Badge>
        </header>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <ReadinessCard score={athlete.readiness} />
          </CardContent>
        </Card>
        <Stat label={t("dashboard", "hrvLabel")} value={`${athlete.hrv} ms`} />
        <Stat label={t("dashboard", "sleepRecovery")} value={athlete.sleepHours} />
        <Stat label={t("hub", "goalCompletion")} value={`${athlete.goalProgress}%`} />
      </section>

      {plan && (
        <CoachPlanPanel
          plan={plan}
          editable
          onToggleBlock={(blockId) => ctx.togglePlanBlock(plan.id, blockId)}
        />
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              {t("hub", "recoveryNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-300 leading-relaxed">
              {plan?.aiSuggestion ?? t("hub", "noPlanYet")}
            </p>
            {plan && (
              <Button
                size="sm"
                variant="outline"
                className="mt-4 min-h-[44px]"
                onClick={() =>
                  updatePlanSuggestion(
                    plan.id,
                    "Adjusted: lighter Thursday — strides only until HRV normalises."
                  )
                }
              >
                {t("hub", "sendRecoveryNudge")}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("dashboard", "messages")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-3 text-sm ${
                  m.unread ? "border-brand-400/40 bg-brand-500/5" : "border-ink-800"
                }`}
              >
                <p className="text-xs text-ink-500 capitalize">{m.from} · {m.when}</p>
                <p className="text-ink-200 mt-1">{m.preview}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );

  return wrapShell ? <DashboardShell>{body}</DashboardShell> : body;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-display font-bold tabular-nums">{value}</p>
        <p className="text-xs text-ink-400 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
