import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: number;
  title?: string;
  priority?: boolean;
  /** Metallic carbon 3D treatment with subtle glow pulse */
  variant?: "default" | "carbon3d";
};

/** Transparent PNG mark — optional 3D carbon metallic shell. */
export function BrandLogo({
  className,
  size = 36,
  title = "FitConnect",
  priority = false,
  variant = "default"
}: BrandLogoProps) {
  const is3d = variant === "carbon3d";

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        is3d && "logo-carbon-3d",
        className
      )}
      style={{ width: size, height: size }}
    >
      {is3d ? (
        <>
          <span aria-hidden className="logo-carbon-3d__glow" />
          <span aria-hidden className="logo-carbon-3d__rim" />
        </>
      ) : null}
      <Image
        src="/logo.png"
        alt={title}
        width={size}
        height={size}
        priority={priority}
        className={cn(
          "relative z-[1] h-auto w-auto object-contain",
          is3d && "logo-carbon-3d__mark drop-shadow-[0_8px_16px_rgba(0,0,0,0.55)]"
        )}
        style={{ width: size * (is3d ? 0.88 : 1), height: size * (is3d ? 0.88 : 1) }}
      />
    </span>
  );
}
