"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachRosterPlaceholderPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <GlassCard tone="live">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Roster</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Your athletes</h1>
        <p className="mt-2 text-sm text-ink-300">
          Full roster analytics move here while the dashboard still holds roster cards today.
        </p>
        <Link
          href="/coach/dashboard"
          className="inline-block mt-4 text-sm font-semibold text-volt-400 hover:text-volt-300"
        >
          Open dashboard roster →
        </Link>
      </GlassCard>
    </AuthGate>
  );
}
