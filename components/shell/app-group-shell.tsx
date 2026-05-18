"use client";

import { useAuthStore } from "@/lib/auth-store";
import { MobileShell } from "./mobile-shell";

const FALLBACK_AVATAR = "/icons/icon-192.png";

export function AppGroupShell({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <>{children}</>;

  return (
    <MobileShell role={user.role} name={user.name} avatarUrl={FALLBACK_AVATAR}>
      {children}
    </MobileShell>
  );
}
