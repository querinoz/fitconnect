import type { ReactNode } from "react";
import { BrandLogo } from "./brand-logo";
import { Wordmark } from "./wordmark";
import { cn } from "@/lib/utils";

type MobileAppHeaderProps = {
  className?: string;
  /** Optional trailing badge (e.g. sync status, OS label) */
  trailing?: ReactNode;
  /** Screen title below the brand row */
  title?: string;
  /** Eyebrow above title (e.g. Athlete OS) */
  eyebrow?: string;
  /** Avatar or action on the right of the title row */
  action?: ReactNode;
};

/** FitConnect brand header for mobile app surfaces — logo + wordmark always visible. */
export function MobileAppHeader({
  className,
  trailing,
  title,
  eyebrow,
  action
}: MobileAppHeaderProps) {
  return (
    <header className={cn("relative shrink-0", className)}>
      <div className="flex items-center gap-2.5">
        <BrandLogo size={32} variant="carbon3d" className="h-8 w-8" />
        <Wordmark size={16} className="min-w-0 flex-1 truncate" />
        {trailing ? (
          <div className="ml-auto shrink-0">{trailing}</div>
        ) : null}
      </div>

      {(title || eyebrow || action) && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-volt-400/85">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="truncate font-display text-lg font-bold leading-tight text-ink-50 sm:text-xl">
                {title}
              </h2>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
    </header>
  );
}
