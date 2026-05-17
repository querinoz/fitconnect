"use client";

import { useInstallPrompt } from "@/lib/pwa/use-install-prompt";
import { VoltButton } from "@/components/ui-glass/volt-button";
import { GlassCard } from "@/components/ui-glass/glass-card";

export function InstallPrompt() {
  const { canInstall, prompt } = useInstallPrompt();
  if (!canInstall) return null;
  return (
    <GlassCard tone="active" className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold">Install FitConnect</p>
        <p className="text-sm text-ink-300">
          Add it to your home screen for the full app feel.
        </p>
      </div>
      <VoltButton onClick={() => void prompt()}>Install</VoltButton>
    </GlassCard>
  );
}
