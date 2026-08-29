"use client";

export const dynamic = "force-dynamic";

import { AuthGate } from "@/components/auth-gate";
import { PlayerProfileCard } from "@/components/profile/player-profile-card";
import { useAuthStore } from "@/lib/auth-store";

export default function AthleteProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AuthGate roles={["athlete", "admin"]}>
      <PlayerProfileCard
        name={user?.name ?? "You"}
        avatarUrl="/icons/icon-192.png"
      />
    </AuthGate>
  );
}
