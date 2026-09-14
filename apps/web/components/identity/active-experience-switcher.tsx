"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BentoCard, EliteButton } from "@/components/elite-os";
import { dashboardPathForRole, type UserRole } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { fetchIdentityMe, persistActiveMode } from "@/lib/identity/client";
import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { cn } from "@/lib/utils";

type Mode = "athlete" | "coach";

function asMode(role: UserRole | null | undefined): Mode {
  return role === "coach" ? "coach" : "athlete";
}

/**
 * Profile CURRENT EXPERIENCE switcher — capability-gated, not a second login.
 * Mirrors Android ActiveExperienceSwitcher.
 */
export function ActiveExperienceSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [capabilities, setCapabilities] = useState<Set<Mode>>(new Set());
  const [activeMode, setActiveMode] = useState<Mode>(asMode(user?.role));
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const demo = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE);
    if (demo) {
      setCapabilities(new Set(["athlete", "coach"]));
      setActiveMode(asMode(user?.role));
      return;
    }

    void fetchIdentityMe().then((me) => {
      if (cancelled) return;
      if (!me) {
        setCapabilities(new Set([asMode(user?.role)]));
        return;
      }
      const next = new Set<Mode>();
      if (me.capabilities.includes("athlete")) next.add("athlete");
      if (me.capabilities.includes("coach")) next.add("coach");
      if (next.size === 0) next.add(asMode(me.activeMode ?? user?.role));
      setCapabilities(next);
      setActiveMode(asMode(me.activeMode ?? user?.role));
    });

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  const hasAthlete = capabilities.has("athlete");
  const hasCoach = capabilities.has("coach");
  if (!user || (!hasAthlete && !hasCoach)) return null;

  async function selectMode(next: Mode) {
    if (next === activeMode || switching || !user) return;
    setError(null);
    setSwitching(true);
    const result = await persistActiveMode(next);
    if (!result) {
      setError("Could not switch experience. Try again.");
      setSwitching(false);
      return;
    }
    login({
      ...user,
      role: result.activeMode,
      athleteId: result.activeMode === "athlete" ? (user.athleteId ?? user.id) : user.athleteId,
      coachId: result.activeMode === "coach" ? (user.coachId ?? user.id) : user.coachId
    });
    setActiveMode(result.activeMode);
    setSwitching(false);
    router.push(dashboardPathForRole(result.activeMode));
  }

  return (
    <BentoCard
      elevation="2"
      data-testid="active_experience_switcher"
      label="CURRENT EXPERIENCE"
    >
      <p className="mb-4 text-sm text-ink-300">
        Same account · same session · switch context only
      </p>
      <div className="space-y-2" role="radiogroup" aria-label="Current experience">
        {hasAthlete ? (
          <ModeOption
            title="Athlete"
            subtitle="Training, recovery, performance & health data"
            selected={activeMode === "athlete"}
            enabled={!switching}
            testId="mode_option_athlete"
            onClick={() => void selectMode("athlete")}
          />
        ) : null}
        {hasCoach ? (
          <ModeOption
            title="Coach"
            subtitle="Athletes, programs, sessions & analytics"
            selected={activeMode === "coach"}
            enabled={!switching}
            testId="mode_option_coach"
            onClick={() => void selectMode("coach")}
          />
        ) : (
          <div className="space-y-3 rounded-2xl border border-white/10 p-4">
            <p className="font-semibold text-ink-50">Coach experience unavailable</p>
            <p className="text-sm text-ink-400">
              Upgrade your plan to unlock Coach — no second login.
            </p>
            <EliteButton asChild variant="secondary" size="sm">
              <Link href="/pricing" data-testid="unlock_coach_cta">
                View plans
              </Link>
            </EliteButton>
          </div>
        )}
      </div>
      {switching ? (
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-eos-voltline" data-testid="mode_switching_label">
          {activeMode === "coach" ? "Switching to Athlete…" : "Switching to Coach…"}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-eos-alert" role="alert">
          {error}
        </p>
      ) : null}
    </BentoCard>
  );
}

function ModeOption({
  title,
  subtitle,
  selected,
  enabled,
  testId,
  onClick
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  enabled: boolean;
  testId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!enabled || selected}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
        selected
          ? "border-eos-voltline/70 bg-eos-voltline/10"
          : "border-white/10 hover:border-white/20",
        (!enabled || selected) && "cursor-default"
      )}
    >
      <span
        className={cn(
          "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
          selected ? "border-eos-voltline" : "border-ink-500"
        )}
        aria-hidden
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-eos-voltline" /> : null}
      </span>
      <span>
        <span className="block font-semibold text-ink-50">{title}</span>
        <span className="mt-0.5 block text-sm text-ink-400">{subtitle}</span>
      </span>
    </button>
  );
}
