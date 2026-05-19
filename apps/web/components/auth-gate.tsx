"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import type { UserRole } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/auth";
import { LiquidLoader } from "@/components/ui-glass/liquid-loader";

function AuthLoading() {
  return <LiquidLoader fullscreen label="Signing in" size="lg" />;
}

type AuthGateProps = {
  children: ReactNode;
  roles?: UserRole[];
};

export function AuthGate({ children, roles }: AuthGateProps) {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);

  // Estabiliza roles — converte para string para comparação por valor
  const rolesKey = roles?.join(",") ?? "";

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (!rolesKey || user.role === "admin") return;
    if (!rolesKey.split(",").includes(user.role)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [hydrated, user, router, rolesKey]); // ← string estável em vez de array

  if (!hydrated && !user) return <AuthLoading />;
  if (!user) return <AuthLoading />;
  if (roles?.length && user.role !== "admin" && !roles.includes(user.role)) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}