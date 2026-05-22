"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { EliteGlass } from "@/components/elite-os";
import type { ShellNavItem } from "@/lib/shell/nav-config";

export function EliteMobileDock({
  items,
  active,
  activeLabel
}: {
  items: ShellNavItem[];
  active: string;
  activeLabel?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className="eos-mobile-dock fixed inset-x-0 z-40 flex justify-center px-3 lg:hidden"
    >
      <div className="w-[min(calc(100%-0.5rem),44rem)]">
        {activeLabel ? (
          <p
            className="eos-label-caps mb-2 text-center text-eos-voltline"
            aria-live="polite"
          >
            {activeLabel}
          </p>
        ) : null}
        <EliteGlass padding="none" radius="control" className="rounded-[var(--eos-radius-modal)] px-1 py-1">
          <ul className="flex items-center justify-between gap-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                active === item.href ||
                (item.href !== "/" && active.startsWith(item.href));
              return (
                <li key={item.href} className="relative flex-1">
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "mx-auto grid h-11 w-full max-w-[3.25rem] place-items-center rounded-[var(--eos-radius-control)] transition-all duration-[var(--eos-duration-ui)]",
                      isActive
                        ? "bg-eos-voltline text-eos-floor shadow-eos-volt"
                        : "text-eos-on-surface-muted hover:bg-white/8 hover:text-eos-on-surface"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 2} />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </EliteGlass>
      </div>
    </nav>
  );
}
