import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "subtle";

const variantClass: Record<Variant, string> = {
  primary: "bg-volt-500 text-ink-950 hover:bg-volt-400 shadow-volt-glow fc-liquid-btn",
  ghost: "bg-transparent text-volt-500 hover:bg-glass-volt fc-liquid-glass",
  subtle:
    "bg-glass-md text-ink-100 hover:bg-glass-hi border border-glass-border fc-liquid-glass"
};

export type VoltButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
};

export const VoltButton = forwardRef<HTMLButtonElement, VoltButtonProps>(
  ({ variant = "primary", className, type = "button", asChild = false, ...rest }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-11 min-w-11 px-5 rounded-full font-semibold tracking-tight transition-all active:scale-[0.98]",
          variantClass[variant],
          className
        )}
        {...rest}
      />
    );
  }
);
VoltButton.displayName = "VoltButton";
