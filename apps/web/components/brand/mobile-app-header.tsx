import type { ReactNode } from "react";
import { BrandLockup } from "./brand-lockup";
import { cn } from "@/lib/utils";

type MobileAppHeaderProps = {
  className?: string;
  trailing?: ReactNode;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
};

/** FitConnect brand header — Option 01 lockup + screen context. */
export function MobileAppHeader({
  className,
  trailing,
  title,
  eyebrow,
  action
}: MobileAppHeaderProps) {
  return (
    <header className={cn("relative shrink-0", className)}>
      <div className="flex items-start justify-between gap-2">
        <BrandLockup logoSize={30} textSize={15} layout="stack" className="min-w-0" />
        {trailing ? <div className="shrink-0 pt-0.5">{trailing}</div> : null}
      </div>

      {(title || eyebrow || action) && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-volt-400/90">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="truncate font-display text-lg font-bold leading-tight text-ink-50">
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
