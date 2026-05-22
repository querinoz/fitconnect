"use client";

import Link from "next/link";
import { ArrowLeft, HeartPulse, Moon, Target } from "lucide-react";
import { DashboardShell } from "./dashboard-shell";
import { CoachPlanPanel } from "./coach-plan-panel";
import { ReadinessCard } from "./readiness-card";
import { BentoCard, BentoGrid, EliteButton, EliteChip } from "@/components/elite-os";
import { EliteStatTile } from "@/components/dashboard/elite";
import { EliteAppPageHeader } from "@/components/shell/elite";
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
      <BentoCard elevation="1">
        <p className="text-sm text-eos-on-surface-muted">{t("hub", "athleteNotFound")}</p>
        <EliteButton asChild variant="secondary" className="mt-4">
          <Link href="/coach/dashboard">{t("hub", "backToRoster")}</Link>
        </EliteButton>
      </BentoCard>
    );
    return wrapShell ? <DashboardShell>{fallback}</DashboardShell> : fallback;
  }

  const { athlete, plan, messages } = ctx;

  const body = (
    <>
      <EliteButton asChild variant="ghost" size="sm" className="-ml-2 w-fit min-h-[44px]">
        <Link href="/coach/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("hub", "backToRoster")}
        </Link>
      </EliteButton>

      <EliteAppPageHeader
        eyebrow={t("hub", "monitorAthlete")}
        title={athlete.name}
        subtitle={athlete.sports.join(" · ")}
        action={
          <EliteChip
            as="span"
            tone={athlete.recoveryStatus === "green" ? "performance" : "recovery"}
          >
            {t("hub", "readiness")} {athlete.readiness}
          </EliteChip>
        }
      />

      <BentoGrid cols={4}>
        <BentoCard elevation="1">
          <ReadinessCard score={athlete.readiness} />
        </BentoCard>
        <EliteStatTile label={t("dashboard", "hrvLabel")} value={`${athlete.hrv} ms`} icon={HeartPulse} />
        <EliteStatTile label={t("dashboard", "sleepRecovery")} value={athlete.sleepHours} icon={Moon} tone="iris" />
        <EliteStatTile label={t("hub", "goalCompletion")} value={`${athlete.goalProgress}%`} icon={Target} tone="volt" />
      </BentoGrid>

      {plan && (
        <CoachPlanPanel
          plan={plan}
          editable
          onToggleBlock={(blockId) => ctx.togglePlanBlock(plan.id, blockId)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <BentoCard elevation="1" label={t("hub", "recoveryNotes")}>
          <p className="text-sm leading-relaxed text-eos-on-surface-muted">
            {plan?.aiSuggestion ?? t("hub", "noPlanYet")}
          </p>
          {plan && (
            <EliteButton
              size="sm"
              variant="secondary"
              className="mt-4 min-h-[44px]"
              onClick={() =>
                updatePlanSuggestion(
                  plan.id,
                  "Adjusted: lighter Thursday — strides only until HRV normalises."
                )
              }
            >
              {t("hub", "sendRecoveryNudge")}
            </EliteButton>
          )}
        </BentoCard>

        <BentoCard elevation="1" label={t("dashboard", "messages")}>
          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-3 text-sm ${
                  m.unread
                    ? "border-eos-iris/40 bg-eos-iris-glow/10"
                    : "border-eos-outline"
                }`}
              >
                <p className="text-xs capitalize text-eos-on-surface-muted">
                  {m.from} · {m.when}
                </p>
                <p className="mt-1 text-ink-200">{m.preview}</p>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </>
  );

  return wrapShell ? <DashboardShell>{body}</DashboardShell> : body;
}
