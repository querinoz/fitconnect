"use client";

import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  PlusCircle,
  Shield,
  User
} from "lucide-react";
import type { ReactNode } from "react";
import { HexAtmosphere } from "@/components/atmosphere/hex-atmosphere";
import { EliteHeader } from "./elite-header";
import { FloatingDock, type DockItem } from "./floating-dock";
import { PageTransition } from "./page-transition";
import type { UserRole } from "@/lib/auth";

/** Canonical mobile navigation — HOME = Social Feed */
const ATHLETE: DockItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/sessions", label: "Create", icon: PlusCircle },
  { href: "/community", label: "Squads", icon: Shield },
  { href: "/profile", label: "Profile", icon: User }
];

const COACH: DockItem[] = [
  { href: "/coach/dashboard", label: "Today", icon: Home },
  { href: "/coach/sessions", label: "Sessions", icon: PlusCircle },
  { href: "/coach/roster", label: "Roster", icon: Shield },
  { href: "/coach/inbox", label: "Inbox", icon: Compass },
  { href: "/coach/profile", label: "Profile", icon: User }
];

export function MobileShell({
  role,
  children
}: {
  role: UserRole;
  name?: string;
  avatarUrl?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const items: DockItem[] = role === "coach" ? COACH : ATHLETE;
  const homeHref = role === "coach" ? "/coach/dashboard" : "/feed";

  return (
    <div className="relative min-h-dvh bg-ink-950 text-ink-100 pb-[calc(96px+env(safe-area-inset-bottom))]">
      <HexAtmosphere />
      <EliteHeader homeHref={homeHref} />
      <main className="px-5">
        <PageTransition>{children}</PageTransition>
      </main>
      <FloatingDock items={items} active={pathname} />
    </div>
  );
}
