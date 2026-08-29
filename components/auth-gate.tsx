"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FitConnectLogo } from "@/components/brand/fitconnect-logo";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import type { UserRole } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/auth";

function AuthLoading() {
  return (
    <div
      className="min-h-screen bg-ink-950 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-ink-300">
        <FitConnectLogo variant="icon" iconSize={48} />
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-volt-500" />
        <p className="text-xs uppercase tracking-[0.16em] text-ink-500">
          Initializing
        </p>
      </div>
    </div>
  );
}

type AuthGateProps = {
  children: ReactNode;
  roles?: UserRole[];
};

export function AuthGate({ children, roles }: AuthGateProps) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);

  const rolesKey = roles?.join(",") ?? "";

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [hydrated, user, roles, rolesKey, router]);

  if (!hydrated || !user) return <AuthLoading />;
  if (roles && !roles.includes(user.role)) return <AuthLoading />;

  return <>{children}</>;
}
