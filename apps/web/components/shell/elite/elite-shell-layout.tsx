import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Primary scroll region below the floating nav / beside the side rail. */
export function ShellMain({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "eos-shell-main relative min-w-0 flex-1 px-4 sm:px-5 lg:px-eos-gutter",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}

/** Desktop content column — max-width workspace with bento gutters. */
export function ShellWorkspace({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[88rem]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Optional right sidebar slot (coach command panels, athlete insights). */
export function ShellSidebar({
  className,
  children,
  side = "right",
  ...props
}: HTMLAttributes<HTMLElement> & { side?: "left" | "right" }) {
  return (
    <aside
      data-side={side}
      className={cn(
        "hidden w-[min(100%,20rem)] shrink-0 xl:block",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

/** Grid wrapper for main + optional sidebar on wide screens. */
export function ShellContentGrid({
  className,
  main,
  sidebar
}: {
  className?: string;
  main: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-eos-lg xl:flex-row xl:items-start",
        className
      )}
    >
      <div className="min-w-0 flex-1">{main}</div>
      {sidebar}
    </div>
  );
}
