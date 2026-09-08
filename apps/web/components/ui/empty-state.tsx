import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Product empty state — Elite OS tokens (interface-design + ui-ux-pro-max empty-state rule).
 * Not for marketing/landing surfaces.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  className
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--eos-on-surface)_18%,transparent)]",
        "bg-[color:color-mix(in_srgb,var(--eos-floor)_88%,var(--eos-surface)_12%)] p-10 text-center",
        className
      )}
    >
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--eos-voltline-dim)] text-[color:var(--eos-voltline)] ring-1 ring-[color:color-mix(in_srgb,var(--eos-voltline)_28%,transparent)]"
        aria-hidden
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-[color:var(--eos-on-surface)]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[color:color-mix(in_srgb,var(--eos-on-surface)_62%,transparent)]">
        {description}
      </p>
      {cta ? (
        <Button asChild className="mt-6 min-h-11 min-w-[11rem]">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
