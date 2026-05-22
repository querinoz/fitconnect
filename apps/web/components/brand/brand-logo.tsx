import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official mark aspect — 320×340 master SVG (circle + heartbeat). */
export const OFFICIAL_LOGO_ASPECT = 340 / 320;

export const OFFICIAL_LOGO_SRC = "/brand/fitconnect-logo.png";
export const OFFICIAL_LOGO_SVG = "/brand/fitconnect-logo-mark.svg";

/** Default display size (px width) — nav, header, lockups. */
export const OFFICIAL_LOGO_SIZE = 44;

type BrandLogoProps = {
  className?: string;
  /** Width in px; height follows official aspect ratio. */
  size?: number;
  title?: string;
  variant?: "carbon3d" | "mono";
  animated?: boolean;
  priority?: boolean;
};

/**
 * Official FitConnect logo — Volt→Connect ring, F mark, ECG pulse.
 */
export function BrandLogo({
  className,
  size = OFFICIAL_LOGO_SIZE,
  title = "FitConnect",
  variant = "carbon3d",
  animated = false,
  priority = false
}: BrandLogoProps) {
  const width = size;
  const height = Math.round(size * OFFICIAL_LOGO_ASPECT);

  return (
    <Image
      src={OFFICIAL_LOGO_SRC}
      alt={title}
      width={width}
      height={height}
      {...(priority ? { priority: true } : {})}
      className={cn(
        "h-auto w-auto shrink-0 object-contain",
        variant === "carbon3d" && "fc-logo-mark fc-logo-elevated",
        variant === "mono" && "brightness-0 invert opacity-90 fc-logo-elevated-mono",
        animated && "fc-logo-pulse",
        className
      )}
    />
  );
}
