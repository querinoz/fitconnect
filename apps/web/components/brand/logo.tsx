import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  animated?: boolean;
  title?: string;
};

/** FitConnect brand mark — transparent PNG connection node. */
export function Logo({ className, title = "FitConnect" }: LogoProps) {
  return (
    <BrandLogo
      title={title}
      size={36}
      className={cn("h-9 w-9", className)}
    />
  );
}

export function LogoMono({ className }: { className?: string }) {
  return (
    <BrandLogo
      title="FitConnect"
      size={20}
      className={cn("h-5 w-5", className)}
    />
  );
}
