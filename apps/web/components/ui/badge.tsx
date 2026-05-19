import { cn } from "@/lib/utils";
import * as React from "react";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-300 ring-1 ring-inset ring-brand-500/30",
        className
      )}
      {...props}
    />
  );
}
