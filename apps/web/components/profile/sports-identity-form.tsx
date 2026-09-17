"use client";

import { useEffect, useState } from "react";
import { BentoCard } from "@/components/elite-os/bento-card";
import { EliteButton } from "@/components/elite-os/elite-button";
import {
  fetchSportsIdentity,
  persistSportsIdentity
} from "@/lib/sport-intelligence/identity-store";
import { listSports, type AthleteGoal, type SportId } from "@/lib/sport-intelligence/sport-registry";
import type { SportLevel } from "@/lib/sport-intelligence/sports-identity";

const GOALS: AthleteGoal[] = [
  "PERFORMANCE",
  "ENDURANCE",
  "STRENGTH",
  "HYPERTROPHY",
  "FAT_LOSS",
  "MUSCLE_GAIN",
  "GENERAL_FITNESS",
  "RECOVERY"
];

const LEVELS: SportLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"];

type Props = { userId: string };

/**
 * PROFILE → SELECT SPORT → GOAL → LEVEL → SAVE (server + cache)
 */
export function SportsIdentityForm({ userId }: Props) {
  const [sport, setSport] = useState<SportId | "">("");
  const [goal, setGoal] = useState<AthleteGoal | "">("");
  const [level, setLevel] = useState<SportLevel | "">("");
  const [secondary, setSecondary] = useState<SportId[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backend, setBackend] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await fetchSportsIdentity(userId);
      if (cancelled) return;
      if (p.primarySport) setSport(p.primarySport);
      if (p.primaryGoal) setGoal(p.primaryGoal);
      if (p.sportLevel) setLevel(p.sportLevel);
      setSecondary(p.secondarySports);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function onSave() {
    if (!sport || !goal) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    try {
      const saved = await persistSportsIdentity({
        userId,
        primarySport: sport as SportId,
        primaryGoal: goal as AthleteGoal,
        sportLevel: (level || null) as SportLevel | null,
        secondarySports: secondary
      });
      setBackend(saved.updatedAtISO ? "server-or-cache" : "cache");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function toggleSecondary(id: SportId) {
    if (id === sport) return;
    setSecondary((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <BentoCard label="SPORTS IDENTITY" className="space-y-4" data-testid="sports-identity-form">
      <p className="text-sm text-eos-on-surface-muted">
        Primary sport drives TRAIN, nutrition context, and dashboard. Goals are never assumed.
      </p>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">Primary sport</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {listSports().map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSport(s.id)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase ${
                sport === s.id
                  ? "border-eos-voltline bg-eos-voltline/10 text-eos-voltline"
                  : "border-eos-outline text-eos-on-surface-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">
          Secondary sports
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {listSports()
            .filter((s) => s.id !== sport)
            .slice(0, 12)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSecondary(s.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase ${
                  secondary.includes(s.id)
                    ? "border-eos-telemetry bg-eos-telemetry/10 text-eos-telemetry"
                    : "border-eos-outline text-eos-on-surface-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">Primary goal</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase ${
                goal === g
                  ? "border-eos-iris bg-eos-iris/10 text-eos-iris-soft"
                  : "border-eos-outline text-eos-on-surface-muted"
              }`}
            >
              {g.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-widest text-eos-on-surface-subtle">Level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase ${
                level === l
                  ? "border-eos-performance text-eos-performance"
                  : "border-eos-outline text-eos-on-surface-muted"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <EliteButton type="button" size="sm" onClick={() => void onSave()} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save identity"}
        </EliteButton>
        {status === "saved" ? (
          <span className="text-xs text-eos-performance">Saved ({backend || "ok"})</span>
        ) : null}
        {status === "error" ? (
          <span className="text-xs text-eos-alert">Select sport + goal before saving</span>
        ) : null}
      </div>
    </BentoCard>
  );
}
