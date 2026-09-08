"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShellNavItem } from "@/lib/shell/nav-config";

export function EliteMobileDock({
  items,
  active,
  trainHref,
  trainLabel = "Train"
}: {
  items: ShellNavItem[];
  active: string;
  trainHref?: string;
  trainLabel?: string;
  /** Kept for EliteAppShell callers; labels now live under each tab. */
  activeLabel?: string;
}) {
  const cradle = Boolean(trainHref) && items.length >= 4;
  const left = cradle ? items.slice(0, 2) : items;
  const right = cradle ? items.slice(2) : [];
  const trainActive = trainHref
    ? active === trainHref || active.startsWith(`${trainHref}/`)
    : false;

  return (
    <nav
      aria-label="Primary"
      className="eos-mobile-dock fixed inset-x-0 z-50 lg:hidden"
    >
      <div className="relative w-full">
        <div
          className={cn(
            "border-t border-eos-voltline/15 bg-eos-mold/75 pb-[env(safe-area-inset-bottom)] backdrop-blur-md",
            cradle ? "min-h-[4.25rem] pt-2" : "min-h-[4.25rem]"
          )}
        >
          <ul className="flex h-full items-end justify-around px-1 pb-2">
            {left.map((item) => (
              <DockTab key={item.href} item={item} active={active} />
            ))}
            {cradle ? <li className="w-20 shrink-0" aria-hidden /> : null}
            {right.map((item) => (
              <DockTab key={item.href} item={item} active={active} />
            ))}
          </ul>
        </div>
        {trainHref ? (
          <Link
            href={trainHref}
            aria-label={trainLabel}
            aria-current={trainActive ? "page" : undefined}
            className="absolute left-1/2 top-0 flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-eos-voltline text-eos-floor shadow-[0_8px_24px_-6px_var(--eos-voltline-glow)]"
          >
            <Dumbbell className="h-7 w-7 -rotate-[18deg]" aria-hidden />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em]">
              {trainLabel}
            </span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

function DockTab({ item, active }: { item: ShellNavItem; active: string }) {
  const Icon = item.icon;
  const isActive =
    active === item.href ||
    (item.href !== "/" && active.startsWith(item.href));
  return (
    <li className="flex-1">
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "mx-auto flex min-h-12 w-full max-w-[4.5rem] flex-col items-center justify-end gap-1 text-[10px] font-medium",
          isActive ? "text-eos-voltline" : "text-eos-on-surface-muted"
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
        <span
          className={cn(
            "h-[3px] w-6 rounded-full",
            isActive ? "bg-eos-voltline" : "bg-transparent"
          )}
          aria-hidden
        />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}
