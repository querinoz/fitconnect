"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { useTheme } from "@/lib/theme/use-theme";
import { ThemePicker } from "@/components/shell/theme-picker";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function AppearanceSettingsPage() {
  const { matchCoach, setMatchCoach, coachTheme } = useTheme();

  return (
    <AuthGate>
      <div className="space-y-4 pb-6">
        <h1 className="text-2xl font-bold font-display text-ink-50">
          Appearance
        </h1>

        <ThemePicker variant="settings" />

        <GlassCard tone="default" className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[12rem]">
            <p className="font-semibold">Match my coach</p>
            <p className="text-sm text-ink-300">
              {coachTheme !== null
                ? "When on, your theme follows your coach's selected theme."
                : "Connect a coach to enable this."}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={matchCoach}
              onChange={(e) => setMatchCoach(e.target.checked)}
              className="sr-only peer"
              disabled={coachTheme === null}
            />
            <span className="w-11 h-6 bg-glass-md rounded-full peer-checked:bg-volt-500 transition-colors" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 bg-ink-100 rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </GlassCard>
      </div>
    </AuthGate>
  );
}
