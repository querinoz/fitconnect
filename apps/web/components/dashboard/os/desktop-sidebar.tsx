"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { LogoMark } from "./logo-mark";
import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

type DesktopSidebarProps = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  nav: SidebarNavItem[];
  profileSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  accent?: "brand" | "lime";
};

export function DesktopSidebar({
  collapsed,
  setCollapsed,
  nav,
  profileSlot,
  footerSlot,
  accent = "brand"
}: DesktopSidebarProps) {
  const pathname = usePathname() ?? "/";
  const activeClass =
    accent === "lime"
      ? "bg-volt-dim text-volt-500 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-volt-500"
      : "bg-connect-dim text-brand-400 font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-brand-400";

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-[var(--border-xs)] bg-carbon-1 backdrop-blur-sm transition-all duration-200 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-ink-800 px-4 py-5",
          collapsed ? "justify-center" : ""
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 transition-opacity hover:opacity-90",
            collapsed ? "justify-center" : ""
          )}
          aria-label="FitConnect home"
        >
          <LogoMark size={26} />
          {!collapsed ? (
            <span className="font-display text-lg font-extrabold tracking-tight">
              Fit<span className="text-volt-500">Connect</span>
            </span>
          ) : null}
        </Link>
      </div>

      {!collapsed && profileSlot ? (
        <div className="border-b border-ink-800 px-4 py-4">{profileSlot}</div>
      ) : null}

      <nav className="flex-1 space-y-1 px-2 py-4">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-[var(--fc-motion-micro)]",
                active
                  ? activeClass
                  : "text-ink-500 hover:bg-ink-800/60 hover:text-ink-300",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed && footerSlot ? (
        <div className="border-t border-ink-800 p-4">{footerSlot}</div>
      ) : null}

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex justify-center border-t border-ink-800 p-4 text-ink-600 transition-colors hover:text-ink-400"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight
          className={cn("h-4 w-4 transition-transform", collapsed ? "" : "rotate-180")}
        />
      </button>
    </aside>
  );
}
