"use client";

import { Check, Flame, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGamificationSummary
} from "@/lib/gamification/store";
import { nextLevelFromXp } from "@/lib/gamification/levels";

export function ProfilePowerRing({
  className,
  variant = "athlete"
}: {
  className?: string;
  variant?: "athlete" | "coach";
}) {
  const { xp, level, nextProgress } = useGamificationSummary(variant);
  const next = nextLevelFromXp(xp);
  const gradientId = `fc-xp-gradient-${variant}`;
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (nextProgress / 100) * c;

  return (
    <div className={cn("fc-card flex items-center gap-4 p-4", className)}>
      <div className="relative grid h-[96px] w-[96px] place-items-center shrink-0">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96" aria-hidden>
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c8ff00" />
              <stop offset="100%" stopColor="#00ddb4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">Lv</p>
          <p className="font-display text-2xl font-bold text-ink-50 tabular-nums">{level.level}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold text-ink-100">
          {level.element}{" "}
          <span className="font-mono text-brand-400">({level.symbol})</span>
        </p>
        <p className="mt-0.5 text-xs text-ink-500">
          {xp.toLocaleString()} XP
          {next ? ` · ${nextProgress}% to Lv ${next.level}` : " · Max level"}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-volt-500 to-brand-400 transition-all duration-700"
            style={{ width: `${nextProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DailyMissions({
  className,
  variant = "athlete"
}: {
  className?: string;
  variant?: "athlete" | "coach";
}) {
  const { daily, superMission, completedToday, streakDays, completeMission } =
    useGamificationSummary(variant);

  return (
    <div className={cn("fc-card space-y-4 p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-volt-500" aria-hidden />
          <h3 className="font-display text-sm font-bold text-ink-100">
            {variant === "coach" ? "Coach missions" : "Daily missions"}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-signal-500/10 px-2 py-0.5 text-[10px] font-bold text-signal-400">
          <Flame className="h-3 w-3" aria-hidden />
          {streakDays}d streak
        </span>
      </div>

      <ul className="space-y-2">
        {daily.map((m) => {
          const done = completedToday.includes(m.id);
          return (
            <li key={m.id}>
              <button
                type="button"
                disabled={done}
                onClick={() => completeMission(m.id, m.xpReward)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                  done
                    ? "border-brand-400/30 bg-brand-400/5 opacity-80"
                    : "border-ink-800 bg-ink-950/40 hover:border-volt-500/30 hover:-translate-y-0.5"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                    done
                      ? "border-brand-400 bg-brand-400/20 text-brand-300"
                      : "border-ink-700 text-ink-600"
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-100">{m.title}</span>
                  <span className="block text-xs text-ink-500">{m.description}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-volt-500">+{m.xpReward}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-volt-500/20 bg-volt-dim/40 p-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-volt-500" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wider text-volt-500">Super mission</p>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-100">{superMission.title}</p>
        <p className="text-xs text-ink-500">{superMission.description}</p>
        <p className="mt-1 text-xs font-bold text-volt-500">+{superMission.xpReward} XP</p>
      </div>
    </div>
  );
}

export function GamificationPanel({
  className,
  variant = "athlete"
}: {
  className?: string;
  variant?: "athlete" | "coach";
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <ProfilePowerRing variant={variant} />
      <DailyMissions variant={variant} />
    </div>
  );
}
