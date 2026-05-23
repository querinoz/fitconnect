"use client";

import type { UserRole } from "@/lib/auth";
import { StitchNativeHeader } from "@/components/mobile/stitch-native-primitives";

function initialsFromName(name?: string) {
  if (!name) return "FC";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Stitch native header — avatar | FITCONNECT | sensors (mobile only). */
export function StitchMobileChrome({
  role,
  name,
  avatarUrl
}: {
  role: UserRole;
  name?: string;
  avatarUrl?: string;
}) {
  void role;
  return (
    <div className="relative shrink-0 lg:hidden">
      <StitchNativeHeader
        initials={initialsFromName(name)}
        avatarUrl={avatarUrl}
        onSensorsClick={() => {
          window.location.href = "/settings/wearables";
        }}
      />
    </div>
  );
}
