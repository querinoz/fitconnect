"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DockItem = { href: string; label: string; icon: LucideIcon };

export function FloatingDock({
  items,
  active,
  activeLabel
}: {
  items: DockItem[];
  active: string;
  activeLabel?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed left-1/2 z-40 bottom-[calc(0.875rem+env(safe-area-inset-bottom))] w-[min(100%,22rem)] -translate-x-1/2 pointer-events-auto"
    >
      {activeLabel ? (
        <p
          className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-volt-400 fc-mobile-dock-label"
          aria-live="polite"
        >
          {activeLabel}
        </p>
      ) : null}
      <ul className="flex items-center gap-1 px-2 py-2 rounded-glass-lg bg-glass-md border border-glass-border backdrop-blur-glass-lg shadow-volt-glow fc-mobile-dock-glow">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            active === item.href ||
            (item.href !== "/" && active.startsWith(item.href));
          return (
            <li key={item.href} className="relative flex-1">
              {isActive ? (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-volt-500 shadow-volt-glow" />
              ) : null}
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "grid place-items-center h-11 w-full rounded-full transition-all",
                  isActive
                    ? "bg-grad-pulse text-ink-950 shadow-volt-glow"
                    : "text-ink-400 hover:text-ink-100"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
