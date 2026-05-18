"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachInboxPlaceholderPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Inbox</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Coach inbox</h1>
        <p className="mt-2 text-sm text-ink-300">
          Thread summaries and approvals will consolidate here beside the realtime channel.
        </p>
      </GlassCard>
    </AuthGate>
  );
}
