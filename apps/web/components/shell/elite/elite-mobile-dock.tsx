"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
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
      className="eos-mobile-dock fixed inset-x-0 z-40 flex justify-center px-2 lg:hidden"
    >
      <div className="w-[min(calc(100%-0.5rem),44rem)]">
        {activeLabel ? (
          <p
            className="mb-2 text-center text-[9px] font-bold uppercase tracking-[0.16em] text-volt-400"
            aria-live="polite"
          >
            {activeLabel}
          </p>
        ) : null}
        <div className="rounded-glass-lg border border-glass-border bg-glass-md px-1 py-1.5 backdrop-blur-glass-lg shadow-volt-glow safe-area-pb sm:px-1.5 sm:py-2">
          <ul className="flex items-center justify-between">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                active === item.href ||
                (item.href !== "/" && active.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "grid h-11 min-w-11 place-items-center rounded-full transition-all duration-200",
                      isActive
                        ? "bg-grad-pulse text-ink-950 shadow-volt-glow"
                        : "text-ink-500 hover:text-ink-100"
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={isActive ? 2.25 : 2} />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
