import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  animated?: boolean;
  title?: string;
};

/** FitConnect brand mark — 3D carbon metallic PNG. */
export function Logo({ className, title = "FitConnect" }: LogoProps) {
  return (
    <BrandLogo
      title={title}
      size={36}
      variant="carbon3d"
      className={cn("h-9 w-9", className)}
    />
  );
}

export function LogoMono({ className }: { className?: string }) {
  return (
    <BrandLogo
      title="FitConnect"
      size={20}
      variant="carbon3d"
      className={cn("h-5 w-5", className)}
    />
  );
}
