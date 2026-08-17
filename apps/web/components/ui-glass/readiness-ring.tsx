import { cn } from "@/lib/utils";

type Props = {
  percent: number;
  label: string;
  size?: number;
  /** Larger typography for dashboard hero layout */
  hero?: boolean;
  className?: string;
  ["data-testid"]?: string;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function trackColor(p: number): string {
  if (p < 40) return "var(--coral-500)";
  if (p < 65) return "var(--amber-400)";
  return "var(--volt-500)";
}

export function ReadinessRing({
  percent,
  label,
  size = 96,
  hero = false,
  className,
  ...rest
}: Props) {
  const p = clamp(percent);
  const color = trackColor(p);
  const percentClass = hero || size >= 160 ? "text-5xl" : size >= 120 ? "text-3xl" : "text-2xl";
  const labelClass = hero || size >= 160 ? "text-[10px]" : "text-[9px]";
  const inset = hero || size >= 140 ? "inset-2" : "inset-1.5";

  return (
    <div
      {...rest}
      className={cn("relative grid place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${p * 3.6}deg, var(--ink-700) 0deg)`
      }}
      data-track={color.includes("coral") ? "coral" : color.includes("amber") ? "amber" : "volt"}
    >
      <div
        className={cn(
          "absolute flex items-center justify-center overflow-hidden rounded-full bg-ink-900",
          inset
        )}
      >
        <div className="flex max-w-full flex-col items-center justify-center px-2">
          <span className={cn(percentClass, "font-extrabold leading-none text-ink-100 tabular-nums")}>
            {p}
          </span>
          <span
            className={cn(
              labelClass,
              "mt-1 max-w-full truncate text-center uppercase tracking-[0.18em] text-ink-400"
            )}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
