"use client";

import { AuthGate } from "@/components/auth-gate";
import { CommunityFeed } from "@/components/community/community-feed";

/** Social home — not a metrics dashboard. Nav lock: Feed. */
export default function AthleteFeedPage() {
  return (
    <AuthGate roles={["athlete", "admin"]}>
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
        <header className="space-y-1">
          <p className="eos-label-caps text-eos-voltline">Feed</p>
          <h1 className="eos-headline text-2xl text-eos-on-surface">Squad</h1>
          <p className="text-sm text-eos-on-surface-muted">
            Social check-ins and PRs. Training metrics live on Dashboard — Strava
            sessions never appear here.
          </p>
        </header>
        <CommunityFeed filteredIds={null} />
      </div>
    </AuthGate>
  );
}
