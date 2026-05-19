"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { ProfileSettingsPanel } from "@/components/mobile/profile-settings-panel";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { useTheme } from "@/lib/theme/use-theme";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachProfilePlaceholderPage() {
  const { matchCoach, setMatchCoach, coachTheme } = useTheme();

  return (
    <AuthGate roles={["coach", "admin"]}>
      <div className="space-y-4 pb-8">
        <PremiumCard tone="volt" className="p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-volt-400">Coach</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Profile</h1>
          <p className="mt-2 text-sm text-ink-300">
            Branding, availability and athlete-facing theme defaults.
          </p>
        </PremiumCard>
        <ProfileSettingsPanel />
        <GlassCard tone="default" className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[12rem]">
            <p className="font-semibold">Match my coach theme for athletes</p>
            <p className="text-sm text-ink-300">
              When on, connected athletes can follow your accent palette.
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
