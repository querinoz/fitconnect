import {
  Activity,
  Bell,
  Calendar,
  Home,
  Trophy,
  UserRound,
  UsersRound,
  type LucideIcon
} from "lucide-react";
import type { UserRole } from "@/lib/auth";
import type { Dict } from "@/lib/i18n";

export type ShellNavItem = { href: string; label: string; icon: LucideIcon };

export function getShellNavItems(
  role: UserRole,
  nav: Dict["mobileApp"]["nav"]
): ShellNavItem[] {
  if (role === "coach") {
    return [
      { href: "/coach/dashboard", label: nav.today, icon: Home },
      { href: "/coach/sessions", label: nav.sessions, icon: Calendar },
      { href: "/coach/roster", label: nav.roster, icon: UsersRound },
      { href: "/coach/inbox", label: nav.inbox, icon: Bell },
      { href: "/coach/profile", label: nav.profile, icon: UserRound }
    ];
  }

    return [
      { href: "/dashboard", label: nav.today, icon: Home },
      { href: "/insights", label: nav.analysis, icon: Activity },
      { href: "/achievements", label: nav.achievements, icon: Trophy },
      { href: "/profile", label: nav.profile, icon: UserRound }
    ];
}

export function resolveActiveNavItem(pathname: string, items: ShellNavItem[]) {
  return (
    items.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href))
    ) ?? items[0]!
  );
}

export function shellGreeting(os: Dict["dashboard"]["os"], h = new Date().getHours()) {
  if (h < 5) return os.greetingLateNight.replace(" 👋", "");
  if (h < 12) return os.greetingMorning.replace(" 👋", "");
  if (h < 18) return os.greetingAfternoon.replace(" 👋", "");
  return os.greetingEvening.replace(" 👋", "");
}
