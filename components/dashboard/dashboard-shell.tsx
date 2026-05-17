"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, LayoutDashboard, Users } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  /** Show floating AI assistant slot (athlete only). */
  assistant?: React.ReactNode;
};

export function DashboardShell({ children, assistant }: DashboardShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const t = useT();

  const tabs = [
    {
      href: "/dashboard",
      label: t("nav", "dashboard"),
      icon: LayoutDashboard,
      active: pathname === "/dashboard" || pathname.startsWith("/dashboard/")
    },
    {
      href: "/coach/dashboard",
      label: t("nav", "coachDashboard"),
      icon: HeartHandshake,
      active:
        pathname === "/coach/dashboard" ||
        pathname.startsWith("/coach/athletes")
    }
  ];

  const showMobileTabs = user?.role === "admin" || user?.role === "coach";

  return (
    <>
      <Nav />
      <main
        id="main"
        className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-24 lg:pb-10"
      >
        {children}
      </main>
      {assistant}
      <Footer />

      {showMobileTabs && (
        <nav
          aria-label={t("hub", "mobileNav")}
          className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-ink-800 bg-ink-950/95 backdrop-blur-xl safe-area-pb"
        >
          <div className="grid grid-cols-2 gap-1 p-2 max-w-lg mx-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 min-h-[52px] text-[11px] font-semibold transition-colors",
                  tab.active
                    ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/40"
                    : "text-ink-400 hover:text-ink-100"
                )}
              >
                <tab.icon className="h-5 w-5" aria-hidden />
                <span className="truncate max-w-full px-1">{tab.label}</span>
              </Link>
            ))}
          </div>
          {user?.role === "coach" && (
            <div className="px-2 pb-2">
              <Link
                href="/coach/dashboard#roster"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold min-h-[44px]",
                  pathname.startsWith("/coach/athletes")
                    ? "text-accent-300 bg-accent-500/10 ring-1 ring-accent-500/30"
                    : "text-ink-400 border border-ink-800"
                )}
              >
                <Users className="h-4 w-4" />
                {t("hub", "roster")}
              </Link>
            </div>
          )}
        </nav>
      )}
    </>
  );
}
