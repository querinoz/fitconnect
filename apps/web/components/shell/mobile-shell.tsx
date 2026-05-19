"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Inbox, User } from "lucide-react";
import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { FloatingDock, type DockItem } from "./floating-dock";
import { PageTransition } from "./page-transition";
import type { UserRole } from "@/lib/auth";

const ATHLETE: DockItem[] = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/sessions", label: "Sessions", icon: Calendar },
  { href: "/my-coach", label: "Coach", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/profile", label: "Profile", icon: User }
];

const COACH: DockItem[] = [
  { href: "/coach/dashboard", label: "Today", icon: Home },
  { href: "/coach/sessions", label: "Sessions", icon: Calendar },
  { href: "/coach/roster", label: "Roster", icon: Users },
  { href: "/coach/inbox", label: "Inbox", icon: Inbox },
  { href: "/coach/profile", label: "Profile", icon: User }
];

function greetingFor(h = new Date().getHours()) {
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
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
  const items: DockItem[] = role === "coach" ? COACH : ATHLETE;
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
        greeting={greetingFor()}
        name={name}
        avatarUrl={avatarUrl}
        tabLabel={onHome ? undefined : activeTab.label}
      />
      <main className="relative min-w-0 px-4 sm:px-5">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingDock items={items} active={pathname} activeLabel={activeTab.label} />
    </div>
  );
}
