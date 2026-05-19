import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink-700 bg-ink-900/30 p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-900 ring-1 ring-ink-800 text-brand-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-ink-400 max-w-md mx-auto">{description}</p>
      {cta && (
        <Button asChild className="mt-6">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
