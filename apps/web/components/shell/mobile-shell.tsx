"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Inbox, User, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { FloatingDock, type DockItem } from "./floating-dock";
import { PageTransition } from "./page-transition";
import type { UserRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n-provider";
import type { Dict } from "@/lib/i18n";

function shellGreeting(os: Dict["dashboard"]["os"], h = new Date().getHours()) {
  if (h < 5) return os.greetingLateNight.replace(" 👋", "");
  if (h < 12) return os.greetingMorning.replace(" 👋", "");
  if (h < 18) return os.greetingAfternoon.replace(" 👋", "");
  return os.greetingEvening.replace(" 👋", "");
}

function resolveActiveTab(pathname: string, items: DockItem[]) {
  return (
    items.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href))
    ) ?? items[0]!
  );
}

export function MobileShell({
  role,
  name,
  avatarUrl,
  children
}: {
  role: UserRole;
  name: string;
  avatarUrl: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const { mobileApp, dashboard } = useLocale();
  const nav = mobileApp.nav;

  const athleteItems: DockItem[] = useMemo(
    () => [
      { href: "/dashboard", label: nav.today, icon: Home },
      { href: "/sessions", label: nav.sessions, icon: Calendar },
      { href: "/map", label: nav.map, icon: MapPin },
      { href: "/my-coach", label: nav.coach, icon: Users },
      { href: "/inbox", label: nav.inbox, icon: Inbox },
      { href: "/profile", label: nav.profile, icon: User }
    ],
    [nav]
  );

  const coachItems: DockItem[] = useMemo(
    () => [
      { href: "/coach/dashboard", label: nav.today, icon: Home },
      { href: "/coach/sessions", label: nav.sessions, icon: Calendar },
      { href: "/coach/roster", label: nav.roster, icon: Users },
      { href: "/coach/inbox", label: nav.inbox, icon: Inbox },
      { href: "/coach/profile", label: nav.profile, icon: User }
    ],
    [nav]
  );

  const items = role === "coach" ? coachItems : athleteItems;
  const activeTab = resolveActiveTab(pathname, items);
  const onHome =
    pathname === "/dashboard" || pathname === "/coach/dashboard";

  useEffect(() => {
    document.documentElement.dataset.motion = "full";
    document.documentElement.classList.add("fc-mobile-shell-active");
    return () => {
      document.documentElement.classList.remove("fc-mobile-shell-active");
    };
  }, []);

  return (
    <div className="fc-mobile-shell relative min-h-dvh w-full max-w-full overflow-x-clip bg-ink-950 text-ink-100 premium-grid pb-[calc(96px+env(safe-area-inset-bottom))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-volt-500/12 via-brand-500/5 to-transparent"
      />
      <TopBar
        greeting={shellGreeting(dashboard.os)}
        name={name}
        avatarUrl={avatarUrl}
        tabLabel={onHome ? undefined : activeTab.label}
        roleLabel={
          role === "coach" ? mobileApp.header.coachEyebrow : mobileApp.header.athleteEyebrow
        }
        role={role}
      />
      <main className="relative min-w-0 px-4 sm:px-5">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingDock
        items={items}
        active={pathname}
        activeLabel={activeTab.label}
      />
    </div>
  );
}
