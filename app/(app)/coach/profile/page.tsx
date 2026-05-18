"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { GlassCard } from "@/components/ui-glass/glass-card";

export default function CoachProfilePlaceholderPage() {
  return (
    <AuthGate roles={["coach", "admin"]}>
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Coach</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-50">Profile</h1>
        <p className="mt-2 text-sm text-ink-300">
          Branding, availability, and theme defaults will migrate into this Voltline pane.
        </p>
        <p className="mt-6">
          <Link
            className="text-sm font-semibold text-volt-500 hover:text-volt-400"
            href="/settings/appearance"
          >
            Appearance and theme →
          </Link>
        </p>
      </GlassCard>
    </AuthGate>
  );
}
