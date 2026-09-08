"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { UserRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n-provider";
import {
  getShellNavItems,
  resolveActiveNavItem,
  shellGreeting
} from "@/lib/shell/nav-config";
import { EliteFloatingNav } from "./elite-floating-nav";
import { EliteMobileDock } from "./elite-mobile-dock";
import { EliteRouteTransition } from "./elite-route-transition";
import { EliteSideRail } from "./elite-side-rail";
import { ShellMain, ShellWorkspace } from "./elite-shell-layout";
import { StitchMobileChrome } from "@/components/mobile/stitch-mobile-chrome";
import { getEffectiveMotionDataset } from "@/lib/motion/should-reduce-motion";

const FALLBACK_AVATAR = "/brand/fitconnect-logo-192.png";

/**
 * Elite OS authenticated shell — side rail (desktop), floating nav, mobile dock.
 */
export function EliteAppShell({
  role,
  name,
  avatarUrl = FALLBACK_AVATAR,
  children
}: {
  role: UserRole;
  name: string;
  avatarUrl?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const { mobileApp, dashboard } = useLocale();

  const items = useMemo(
    () => getShellNavItems(role, mobileApp.nav),
    [role, mobileApp.nav]
  );
  const activeTab = resolveActiveNavItem(pathname, items);
  const onHome =
    pathname === "/dashboard" || pathname === "/coach/dashboard";
  const roleHome = role === "coach" ? "/coach/dashboard" : "/dashboard";

  useEffect(() => {
    document.documentElement.dataset.motion = getEffectiveMotionDataset();
    document.documentElement.classList.add(
      "fc-mobile-shell-active",
      "eos-app-shell-active"
    );
    return () => {
      document.documentElement.classList.remove(
        "fc-mobile-shell-active",
        "eos-app-shell-active"
      );
    };
  }, []);

  return (
    <div className="eos-app-shell relative flex min-h-dvh w-full max-w-full overflow-x-clip bg-eos-floor text-eos-on-surface pb-[calc(6.75rem+env(safe-area-inset-bottom))] lg:bg-eos-floor lg:pb-0">
      <EliteSideRail items={items} roleHome={roleHome} />

      <div className="eos-app-shell__workspace relative flex min-w-0 flex-1 flex-col lg:min-h-dvh">
        <StitchMobileChrome role={role} name={name} avatarUrl={avatarUrl} />

        <div className="hidden lg:block">
          <EliteFloatingNav
            greeting={shellGreeting(dashboard.os)}
            name={name}
            avatarUrl={avatarUrl}
            tabLabel={onHome ? undefined : activeTab.label}
            roleLabel={
              role === "coach"
                ? mobileApp.header.coachEyebrow
                : mobileApp.header.athleteEyebrow
            }
            role={role}
          />
        </div>

        <ShellMain className="px-0 sm:px-0 lg:px-eos-gutter">
          <ShellWorkspace>
            <EliteRouteTransition>{children}</EliteRouteTransition>
          </ShellWorkspace>
        </ShellMain>

        <EliteMobileDock
          items={items}
          active={pathname}
          trainHref={role === "athlete" ? "/sessions" : undefined}
          trainLabel={mobileApp.nav.train}
        />
      </div>
    </div>
  );
}
