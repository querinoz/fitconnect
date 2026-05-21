import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Nivis glass surface for dashboard / landing panels */
export function NivisPanel({
  children,
  className,
  interactive = false,
  id
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "nivis-glass-panel rounded-2xl",
        interactive && "fc-liquid-interactive transition hover:border-volt-500/25",
        className
      )}
    >
      {children}
    </div>
  );
}
