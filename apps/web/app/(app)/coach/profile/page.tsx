"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { ProfileSettingsPanel } from "@/components/mobile/profile-settings-panel";
import { EliteAppPage } from "@/components/shell/elite";
import { BentoCard } from "@/components/elite-os";
import { useTheme } from "@/lib/theme/use-theme";

export default function CoachProfilePlaceholderPage() {
  const { matchCoach, setMatchCoach, coachTheme } = useTheme();

  return (
    <AuthGate roles={["coach", "admin"]}>
      <EliteAppPage
        eyebrow="Coach"
        title="Profile"
        subtitle="Branding, availability and athlete-facing theme defaults."
      >
        <ProfileSettingsPanel />
        <BentoCard elevation="1" className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[12rem]">
            <p className="font-semibold text-ink-50">Match my coach theme for athletes</p>
            <p className="text-sm text-ink-300">
              When on, connected athletes can follow your accent palette.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={matchCoach}
              onChange={(e) => setMatchCoach(e.target.checked)}
              className="peer sr-only"
              disabled={coachTheme === null}
            />
            <span className="h-6 w-11 rounded-full bg-eos-carbon transition-colors peer-checked:bg-eos-voltline" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-ink-100 transition-transform peer-checked:translate-x-5" />
          </label>
        </BentoCard>
      </EliteAppPage>
    </AuthGate>
  );
}
