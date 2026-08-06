"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BrandLockup } from "@/components/brand/brand-lockup";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { useShellStore } from "@/lib/shell/shell-store";
import { useEliteMotion } from "@/lib/motion/use-elite-motion";
import type { ShellNavItem } from "@/lib/shell/nav-config";

export function EliteSideRail({
  items,
  roleHome
}: {
  items: ShellNavItem[];
  roleHome: string;
}) {
  const pathname = usePathname() ?? "/";
  const sidebarCollapsed = useShellStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useShellStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useShellStore((s) => s.setMobileNavOpen);
  const { overlay } = useEliteMotion();

  return (
    <>
      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.button
            key="shell-nav-overlay"
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-eos-floor/70 backdrop-blur-sm lg:hidden"
            initial={overlay.initial}
            animate={overlay.animate}
            exit={overlay.exit}
            transition={overlay.transition}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        data-collapsed={sidebarCollapsed ? "true" : "false"}
        data-open={mobileNavOpen ? "true" : "false"}
        className={cn(
          "eos-side-rail fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100%-3rem))] flex-col border-r border-eos-outline bg-eos-carbon/95 backdrop-blur-xl transition-transform duration-[var(--eos-duration-screen)] lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:w-auto lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-eos-outline px-4 py-4",
            sidebarCollapsed ? "justify-center lg:px-3" : "gap-3"
          )}
        >
          {sidebarCollapsed ? (
            <Link href={roleHome} aria-label="FitConnect home">
              <BrandLogo size={32} />
            </Link>
          ) : (
            <BrandLockup
              href={roleHome}
              layout="inline"
              logoSize={28}
              textSize={13}
            />
          )}
        </div>

        <nav aria-label="App" className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-[var(--eos-radius-control)] px-3 py-2.5 text-sm font-medium transition-all duration-[var(--eos-duration-ui)]",
                      sidebarCollapsed && "lg:justify-center lg:px-2",
                      isActive
                        ? "bg-eos-voltline-dim text-eos-voltline shadow-[inset_0_0_0_1px_rgba(200,255,0,0.18)]"
                        : "text-eos-on-surface-muted hover:bg-white/5 hover:text-eos-on-surface"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        isActive ? "text-eos-voltline" : "text-eos-on-surface-subtle group-hover:text-eos-on-surface"
                      )}
                      strokeWidth={isActive ? 2.25 : 2}
                    />
                    <span className={cn("truncate", sidebarCollapsed && "lg:sr-only")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
