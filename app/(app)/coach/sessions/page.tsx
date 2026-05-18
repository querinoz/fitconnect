"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachSessionsPlaceholderPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Coming soon</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Coach sessions</h1>
        <p className="mt-2 text-sm text-ink-300">
          Programmed blocks and live session controls arrive with the realtime loop.
        </p>
      </GlassCard>
    </AuthGate>
  );
}
