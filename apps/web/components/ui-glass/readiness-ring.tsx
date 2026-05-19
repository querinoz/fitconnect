import { cn } from "@/lib/utils";

type Props = {
  percent: number;
  label: string;
  size?: number;
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
  className,
  ...rest
}: Props) {
  const p = clamp(percent);
  const color = trackColor(p);
  return (
    <div
      {...rest}
      className={cn("relative grid place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${p * 3.6}deg, var(--ink-700) 0deg)`,
      }}
      data-track={color.includes("coral") ? "coral" : color.includes("amber") ? "amber" : "volt"}
    >
      <div className="absolute inset-1.5 rounded-full bg-ink-900 grid place-items-center overflow-hidden">
        <span className="text-2xl font-extrabold text-ink-100 leading-none">{p}</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-ink-400 mt-1 text-center px-1">
          {label}
        </span>
      </div>
    </div>
  );
}
