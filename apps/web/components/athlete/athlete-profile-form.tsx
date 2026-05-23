"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { useAuthStore } from "@/lib/auth-store";
import {
  selectAthlete,
  useDashboardStore
} from "@/lib/dashboard-store";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";
import type { Sport } from "@/lib/data";
import { SPORTS } from "@/lib/data";

export function AthleteProfileForm() {
  const user = useAuthStore((s) => s.user);
  const athleteId = user?.athleteId ?? DEMO_ATHLETE_ID;
  const athlete = useDashboardStore((s) => selectAthlete(s, athleteId));
  const update = useDashboardStore((s) => s.updateAthleteProfile);

  const [goal, setGoal] = useState(athlete?.goalTitle ?? "");
  const [sports, setSports] = useState<Sport[]>(
    (athlete?.sports as Sport[]) ?? []
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!athlete) return;
    setGoal(athlete.goalTitle);
    setSports(athlete.sports as Sport[]);
  }, [athlete, athlete?.id, athlete?.goalTitle, athlete?.sports]);

  if (!athlete) return null;

  function toggleSport(sport: Sport) {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    update(athleteId, {
      goalTitle: goal,
      sports,
      goalProgress: athlete!.goalProgress
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <PremiumCard className="p-4 space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-ink-500">
            90-day goal
          </span>
          <input
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value);
              setSaved(false);
            }}
            className="mt-2 w-full rounded-xl border border-ink-800 bg-ink-950/60 px-3 py-2 text-sm text-ink-100"
            required
          />
        </label>

        <fieldset>
          <legend className="text-xs uppercase tracking-widest text-ink-500">
            Sports & levels
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SPORTS.map((sport) => {
              const active = sports.includes(sport);
              return (
                <button
                  key={sport}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSport(sport)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-brand-400/60 bg-brand-500/15 text-brand-200"
                      : "border-ink-800 text-ink-400 hover:border-ink-600"
                  }`}
                >
                  {sport}
                </button>
              );
            })}
          </div>
        </fieldset>

        <Button type="submit" className="w-full sm:w-auto">
          {saved ? "Saved" : "Save profile"}
        </Button>
      </PremiumCard>
    </form>
  );
}
