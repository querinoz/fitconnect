"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthHydrated } from "@/lib/use-auth-hydrated";
import type { UserRole } from "@/lib/auth";
import { dashboardPathForRole, validateCredentials } from "@/lib/auth";
import { persistClientAuthSession } from "@/lib/auth/complete-login";
import { LiquidLoader } from "@/components/ui-glass/liquid-loader";
import { VoltButton } from "@/components/ui-glass/volt-button";

function AuthLoading({ label = "Signing in" }: { label?: string }) {
  return <LiquidLoader fullscreen label={label} size="lg" />;
}

type AuthGateProps = {
  children: ReactNode;
  roles?: UserRole[];
};

function demoUserForPath(pathname: string, demoParam: string | null) {
  if (demoParam === "coach" || pathname.startsWith("/coach")) {
    return validateCredentials("Coach", "Coach");
  }
  if (demoParam === "athlete" || pathname.startsWith("/dashboard")) {
    return validateCredentials("Athlete", "Athlete");
  }
  return null;
}

export function AuthGate({ children, roles }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const [timedOut, setTimedOut] = useState(false);
  const [demoParam, setDemoParam] = useState<string | null>(null);

  const rolesKey = roles?.join(",") ?? "";
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoParam(new URLSearchParams(window.location.search).get("demo"));
  }, [pathname]);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  // Auto-login demo coach/athlete — switch role when ?demo=coach|athlete or path implies role
  useEffect(() => {
    if (!hydrated) return;

    const explicitDemo =
      demoParam === "1" || demoParam === "coach" || demoParam === "athlete";
    const pathDemo =
      isDemoMode &&
      (pathname.startsWith("/coach") || pathname.startsWith("/dashboard"));

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
      const demo =
        pathname.startsWith("/coach") ? "&demo=coach" : pathname.startsWith("/dashboard") ? "&demo=athlete" : "";
      router.replace(`/signin?next=${next}${demo}`);
    }
  }, [hydrated, timedOut, user, router, pathname]);

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
          Use demo credentials: Coach / Coach or Athlete / Athlete
        </p>
        <div className="flex flex-wrap justify-center gap-3">
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
        </div>
      </div>
    );
  }

  if (roles?.length && user.role !== "admin" && !roles.includes(user.role)) {
    return <AuthLoading label="Redirecting" />;
  }

  return <>{children}</>;
}
