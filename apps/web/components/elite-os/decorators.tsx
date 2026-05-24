import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CornerTicksProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
  opacity?: number;
};

/** F1 telemetry corner brackets (Stitch reference). */
export function CornerTicks({
  className,
  size = 10,
  opacity = 0.2,
  ...props
}: CornerTicksProps) {
  const style = { width: size, height: size, borderColor: `rgba(255,255,255,${opacity})` };
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden {...props}>
      <span className="absolute left-0 top-0 border-l border-t" style={style} />
      <span className="absolute right-0 top-0 border-r border-t" style={style} />
      <span className="absolute bottom-0 left-0 border-b border-l" style={style} />
      <span className="absolute bottom-0 right-0 border-b border-r" style={style} />
    </div>
  );
}

type CrosshairBgProps = HTMLAttributes<HTMLDivElement> & {
  gridSize?: number;
  showGlow?: boolean;
};

/** Crosshair grid + optional radial glows (Stitch landing reference). */
export function CrosshairBg({
  className,
  gridSize = 40,
  showGlow = true,
  children,
  ...props
}: CrosshairBgProps) {
  return (
    <div
      className={cn("eos-crosshair-bg relative", showGlow && "eos-crosshair-glow", className)}
      style={
        {
          "--eos-crosshair-size": `${gridSize}px`
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

/** Alias for LabelCaps — mono uppercase telemetry labels. */
export { LabelCaps as EosLabel } from "./typography";
