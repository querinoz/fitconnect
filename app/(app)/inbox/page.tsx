"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function AthleteInboxPlaceholderPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Coming soon</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Inbox</h1>
        <p className="mt-2 text-sm text-ink-300">
          Coach messages and alerts will appear here in a later phase.
        </p>
      </GlassCard>
    </AuthGate>
  );
}
