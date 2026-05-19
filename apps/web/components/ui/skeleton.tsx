import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton h-4 w-full", className)} {...props} />;
}

export function TrainerCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40">
      <div className="aspect-[5/3] skeleton rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-1/3 h-3" />
          <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="w-2/3 h-3" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-ink-800 bg-ink-900/40">
      <div className="aspect-[16/9] skeleton rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="w-2/3 h-4" />
        <Skeleton className="w-1/2 h-3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-12 h-3" />
        </div>
      </div>
    </div>
  );
}
