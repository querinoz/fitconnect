"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ShellNavItem } from "@/lib/shell/nav-config";

export function EliteMobileDock({
  items,
  active
}: {
  items: ShellNavItem[];
  active: string;
  activeLabel?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className="eos-mobile-dock fixed inset-x-0 z-50 flex justify-center lg:hidden"
    >
      <div className="w-[min(calc(100%-3rem),28rem)] rounded-full border border-white/10 bg-[#1f1f28]/80 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl safe-area-pb">
        <ul className="flex items-center justify-around">
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
                    "grid h-12 w-12 place-items-center rounded-full transition-all duration-200",
                    isActive
                      ? "bg-[#c0f500] text-[#161f00] shadow-[0_0_15px_rgba(200,255,0,0.4)]"
                      : "text-ink-400 hover:bg-white/5 hover:text-[#c0f500]"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
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
