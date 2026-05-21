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
      className="fixed left-1/2 z-40 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] w-[min(calc(100%-1.5rem),44rem)] -translate-x-1/2"
    >
      {activeLabel ? (
        <p
          className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-volt-500"
          aria-live="polite"
        >
          {activeLabel}
        </p>
      ) : null}
      <div className="nivis-bar__brand !flex-none !w-full !max-w-none">
        <ul className="flex w-full items-center justify-between gap-1 px-1">
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
                    "mx-auto grid h-10 w-full max-w-[3.25rem] place-items-center rounded-full transition-all",
                    isActive
                      ? "bg-volt-500 text-ink-950 shadow-[0_8px_24px_-8px_var(--volt-glow)]"
                      : "text-ink-400 hover:bg-white/8 hover:text-ink-100"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
