import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { glassPanelVariants, type GlassPanelVariants } from "@/lib/design-system/variants";

export type EliteGlassProps = HTMLAttributes<HTMLDivElement> & GlassPanelVariants;

/** Glass overlay surface — nav, modals, floating panels. */
export function EliteGlass({ className, padding, radius, ...props }: EliteGlassProps) {
  return (
    <div className={cn(glassPanelVariants({ padding, radius }), className)} {...props} />
  );
}
