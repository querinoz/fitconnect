import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type DashboardHeaderProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  className?: string;
};

/** Shared page header for athlete and coach dashboards. */
export function DashboardHeader({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  actions,
  className
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        className
      )}
    >
      <div>
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Icon aria-hidden className="h-3.5 w-3.5" /> {eyebrow}
        </p>
        <h1 className="fc-vt-hero mt-2 font-display text-3xl md:text-4xl font-bold">
          {title}
        </h1>
        <p className="text-ink-400">{subtitle}</p>
      </div>
      {actions ? <div className="flex gap-2 flex-wrap">{actions}</div> : null}
    </header>
  );
}
