"use client";

import type { ReactNode } from "react";
import { EliteBentoMotion } from "@/components/dashboard/elite";
import { BodyText, Headline, LabelCaps } from "@/components/elite-os/typography";
import { cn } from "@/lib/utils";

type EliteAppPageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function EliteAppPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className
}: EliteAppPageHeaderProps) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <LabelCaps className="text-eos-iris-soft">{eyebrow}</LabelCaps> : null}
        <Headline className="mt-2 text-2xl md:text-3xl">{title}</Headline>
        {subtitle ? (
          <BodyText className="mt-2 max-w-2xl text-sm text-eos-on-surface-muted">
            {subtitle}
          </BodyText>
        ) : null}
      </div>
      {action}
    </header>
  );
}

type EliteAppPageProps = EliteAppPageHeaderProps & {
  children: ReactNode;
  animate?: boolean;
};

/** Standard Elite OS page scaffold for authenticated secondary routes. */
export function EliteAppPage({
  eyebrow,
  title,
  subtitle,
  action,
  children,
  className,
  animate = true
}: EliteAppPageProps) {
  const content = (
    <div className={cn("space-y-5 pb-8", className)}>
      <EliteAppPageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={action}
      />
      {children}
    </div>
  );

  if (!animate) return content;
  return <EliteBentoMotion>{content}</EliteBentoMotion>;
}
