"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/coach-verification", label: "Coaches" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-ink-800 pb-4">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/40"
                : "text-ink-400 hover:text-ink-200 hover:bg-ink-900"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
