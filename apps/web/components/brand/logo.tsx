import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  animated?: boolean;
  title?: string;
};

/** FitConnect official brand mark. */
export function Logo({ className, animated, title = "FitConnect" }: LogoProps) {
  return (
    <BrandLogo
      title={title}
      size={36}
      variant="carbon3d"
      animated={animated}
      className={cn("h-9 w-auto max-w-[2.25rem]", className)}
    />
  );
}

export function LogoMono({ className }: { className?: string }) {
  return (
    <BrandLogo
      title="FitConnect"
      size={20}
      variant="mono"
      className={cn("h-5 w-5 text-volt-500", className)}
    />
  );
}
