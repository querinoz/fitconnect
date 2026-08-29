"use client";

import { AuthGate } from "@/components/auth-gate";
import { CommunityFeed } from "@/components/community/community-feed";

/** Authenticated social feed — canonical HOME destination */
export default function FeedPage() {
  return (
    <AuthGate>
      <CommunityFeed compact />
    </AuthGate>
  );
}
