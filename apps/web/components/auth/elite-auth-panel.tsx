import type { ReactNode } from "react";
import { EliteGlass } from "@/components/elite-os/elite-glass";
import { EliteChip } from "@/components/elite-os/elite-chip";
import { BodyText, Headline } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

type EliteAuthPanelProps = {
  badge?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
};

/** Glass auth card — signin, signup wizard, intercepting modals. */
export function EliteAuthPanel({
  badge,
  title,
  subtitle,
  children,
  className,
  headerAction
}: EliteAuthPanelProps) {
  return (
    <EliteGlass
      padding="lg"
      radius="modal"
      className={cn(
        "relative border-eos-outline shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]",
        className
      )}
    >
      {(badge || headerAction) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {badge ? (
            <EliteChip tone="iris" as="span" className="text-[10px]">
              {badge}
            </EliteChip>
          ) : (
            <span />
          )}
          {headerAction}
        </div>
      )}

      {title ? <Headline className="text-xl md:text-2xl">{title}</Headline> : null}
      {subtitle ? <BodyText className="mt-2 mb-5 text-sm">{subtitle}</BodyText> : null}
      {!subtitle && title ? <div className="mb-5" aria-hidden /> : null}

      {children}
    </EliteGlass>
  );
}
