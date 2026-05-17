import { cn } from "@/lib/utils";

type BrowserFrameProps = {
  path: string;
  children: React.ReactNode;
  className?: string;
};

/** Shared browser chrome for dashboard previews and marketing mockups. */
export function BrowserFrame({ path, children, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-ink-800 bg-ink-900/70 shadow-elevated overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-ink-800 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-signal-500/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" aria-hidden />
        <span className="ml-3 text-xs text-ink-500 font-mono truncate">{path}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
