"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import type { UserRole } from "@/lib/auth";
import { dashboardPathForRole, validateCredentials } from "@/lib/auth";
import { persistClientAuthSession } from "@/lib/auth/complete-login";
import { demoRoleForPath, isAthleteAppPath, isCoachAppPath } from "@/lib/auth/demo-path";
import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { LiquidLoader } from "@/components/ui-glass/liquid-loader";
import { VoltButton } from "@/components/ui-glass/volt-button";

function AuthLoading({ label = "Signing in" }: { label?: string }) {
  return <LiquidLoader fullscreen label={label} size="lg" />;
}

type AuthGateProps = {
  children: ReactNode;
  roles?: UserRole[];
};

function isAthleteDemoPath(pathname: string) {
  return isAthleteAppPath(pathname);
}

function demoUserForPath(pathname: string, demoParam: string | null) {
  const role = demoRoleForPath(pathname, demoParam);
  if (role === "coach") return validateCredentials("Coach", "Coach");
  if (role === "athlete") return validateCredentials("Athlete", "Athlete");
  return null;
}

/**
 * Client gate for app shells. Demo auto-login (?demo= / path demos) only when
 * NEXT_PUBLIC_DEMO_MODE=true. With demo off, UI cannot invent authenticated users.
 */
export function AuthGate({ children, roles }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const [timedOut, setTimedOut] = useState(false);
  const [demoParam, setDemoParam] = useState<string | null>(null);

  const rolesKey = roles?.join(",") ?? "";
  const isDemoMode = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoParam(new URLSearchParams(window.location.search).get("demo"));
  }, [pathname]);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  // LOCAL_DEMO only — never honor ?demo= when production demo flag is off.
  useEffect(() => {
    if (!hydrated || !isDemoMode) return;

    const explicitDemo =
      demoParam === "1" || demoParam === "coach" || demoParam === "athlete";
    const pathDemo =
      pathname.startsWith("/coach") || isCoachAppPath(pathname) || isAthleteDemoPath(pathname);

    if (!explicitDemo && !pathDemo) return;

    const demoUser = demoUserForPath(pathname, demoParam);
    if (!demoUser) return;

    const shouldSwitch =
      !user ||
      (explicitDemo && user.role !== demoUser.role) ||
      (pathDemo && !user && !demoParam);

    if (shouldSwitch) persistClientAuthSession(demoUser);
  }, [hydrated, user, isDemoMode, demoParam, pathname]);

  useEffect(() => {
    if (!hydrated && !timedOut) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      const demoSuffix = isDemoMode
        ? isCoachAppPath(pathname)
          ? "&demo=coach"
          : isAthleteDemoPath(pathname)
            ? "&demo=athlete"
            : ""
        : "";
      router.replace(`/signin?next=${next}${demoSuffix}`);
    }
  }, [hydrated, timedOut, user, router, pathname, isDemoMode]);

  useEffect(() => {
    if (!hydrated || !user) return;
    if (!rolesKey || user.role === "admin") return;
    if (!rolesKey.split(",").includes(user.role)) {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [hydrated, user, router, rolesKey]);

  const ready = hydrated || timedOut;

  if (!ready && !user) return <AuthLoading />;

  if (!user) {
    if (!timedOut) return <AuthLoading label="Redirecting to sign in" />;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-ink-100">Sign in required</p>
        <p className="max-w-sm text-sm text-ink-400">
          {isDemoMode
            ? "Use demo credentials: Coach / Coach or Athlete / Athlete"
            : "Sign in with your FitConnect account to continue."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {isDemoMode ? (
            <>
              <VoltButton asChild>
                <Link href={`/signin?next=${encodeURIComponent(pathname)}&demo=coach`}>
                  Sign in as coach
                </Link>
              </VoltButton>
              <VoltButton variant="ghost" asChild>
                <Link href={`/signin?next=${encodeURIComponent(pathname)}&demo=athlete`}>
                  Sign in as athlete
                </Link>
              </VoltButton>
            </>
          ) : (
            <VoltButton asChild>
              <Link href={`/signin?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
            </VoltButton>
          )}
        </div>
      </div>
    );
  }

  if (roles?.length && user.role !== "admin" && !roles.includes(user.role)) {
    return <AuthLoading label="Redirecting" />;
  }

  return <>{children}</>;
}
