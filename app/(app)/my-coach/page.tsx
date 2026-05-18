"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function AthleteMyCoachPlaceholderPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <GlassCard tone="active">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Your coach</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Coach hub</h1>
        <p className="mt-2 text-sm text-ink-300">
          Messaging, plan updates, and live session entry will anchor here.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 h-11 min-w-11 px-5 rounded-full font-semibold tracking-tight transition-all active:scale-[0.98] mt-4 bg-glass-md text-ink-100 hover:bg-glass-hi border border-glass-border"
        >
          Back to dashboard
        </Link>
      </GlassCard>
    </AuthGate>
  );
}
