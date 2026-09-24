import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { EliteGlass, type EliteGlassProps } from "./elite-glass";

export type ZenithGlassIntensity = "subtle" | "standard" | "premium";

export type ZenithGlassProps = EliteGlassProps & {
  /**
   * Visual weight. Does not pull QuickLiquid globally —
   * intensity maps to FitConnect-native frost CSS with @supports fallback.
   */
  intensity?: ZenithGlassIntensity;
  /** Prefer for floating chrome (login, FAB menus, command surfaces). */
  floating?: boolean;
};

/**
 * FitConnect-native glass surface. Prefer this over ad-hoc blur utilities.
 * QuickLiquid may enhance specific surfaces later; this component always
 * degrades to solid frost + rim when backdrop-filter is unavailable.
 */
export function ZenithGlass({
  className,
  intensity = "standard",
  floating = false,
  ...props
}: ZenithGlassProps) {
  return (
    <EliteGlass
      data-zenith-glass=""
      data-intensity={intensity}
      data-floating={floating ? "true" : undefined}
      className={cn("zenith-glass", className)}
      {...props}
    />
  );
}

/** Re-export props helper for tests / story consumers. */
export type { HTMLAttributes };
