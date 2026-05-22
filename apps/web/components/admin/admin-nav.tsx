"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { eliteChipVariants } from "@/lib/design-system/variants";
import { LabelCaps } from "@/components/elite-os/typography";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/coach-verification", label: "Coaches" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" }
];

export function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Admin sections" className="space-y-4 border-b border-eos-outline pb-4">
      <LabelCaps className="text-eos-iris-soft">FitConnect Admin</LabelCaps>
      <div className="flex flex-wrap gap-2">
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
                eliteChipVariants({ tone: active ? "iris" : "neutral" }),
                !active && "hover:border-eos-iris/25 hover:text-eos-on-surface"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
