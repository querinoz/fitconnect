"use client";

import { useAuthStore } from "@/lib/auth-store";
import { EliteAppShell } from "./elite/elite-app-shell";
import { OfflineBanner } from "./offline-banner";
import { CommandPaletteHost } from "./command-palette";
import { PwaTitlebar } from "@/components/pwa/pwa-titlebar";

const FALLBACK_AVATAR = "/brand/fitconnect-logo-192.png";

export function AppGroupShell({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <>{children}</>;

  return (
    <>
      <PwaTitlebar />
      <CommandPaletteHost role={user.role} />
      <EliteAppShell role={user.role} name={user.name} avatarUrl={FALLBACK_AVATAR}>
        <OfflineBanner />
        {children}
      </EliteAppShell>
    </>
  );
}
