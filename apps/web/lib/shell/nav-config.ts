import {
  Calendar,
  Home,
  Inbox,
  MapPin,
  User,
  Users,
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
      { href: "/coach/roster", label: nav.roster, icon: Users },
      { href: "/coach/inbox", label: nav.inbox, icon: Inbox },
      { href: "/coach/profile", label: nav.profile, icon: User }
    ];
  }

  return [
    { href: "/dashboard", label: nav.today, icon: Home },
    { href: "/sessions", label: nav.sessions, icon: Calendar },
    { href: "/map", label: nav.map, icon: MapPin },
    { href: "/my-coach", label: nav.coach, icon: Users },
    { href: "/inbox", label: nav.inbox, icon: Inbox },
    { href: "/profile", label: nav.profile, icon: User }
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
