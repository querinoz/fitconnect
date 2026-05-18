"use client";

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
  return (
    <div className="min-h-dvh bg-ink-950 text-ink-100 pb-[calc(96px+env(safe-area-inset-bottom))]">
      <TopBar greeting={greetingFor()} name={name} avatarUrl={avatarUrl} />
      <main className="px-5">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingDock items={items} active={pathname} />
    </div>
  );
}
