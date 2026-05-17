"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Dumbbell } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import type { UserRole } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/auth";

function AuthLoading() {
  return (
    <div
      className="min-h-screen gradient-bg flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-ink-300">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 text-ink-950 shadow-glow">
          <Dumbbell className="h-6 w-6 animate-pulse" aria-hidden="true" />
        </span>
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-700 border-t-brand-400" />
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

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (!roles?.length || user.role === "admin") return;
    if (!roles.includes(user.role)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [hydrated, user, router, roles]);

  if (!hydrated && !user) return <AuthLoading />;
  if (!user) return <AuthLoading />;
  if (roles?.length && user.role !== "admin" && !roles.includes(user.role)) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
