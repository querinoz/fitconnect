import Image from "next/image";
import { cn } from "@/lib/utils";

/** Official mark aspect — 320×340 master (LogoBase). */
export const OFFICIAL_LOGO_ASPECT = 340 / 320;

/** Transparent PNG — single source for all in-app surfaces. */
export const OFFICIAL_LOGO_SRC = "/brand/fitconnect-logo.png";

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
 * Official FitConnect logo — transparent PNG (Voltline #C8FF00, white F).
 * Universal shadow via `.fc-logo-mark` for light/dark/glass surfaces.
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
