import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EliteAuthRoleToggle({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: "athlete" | "coach") => void;
  options?: Array<{ value: "athlete" | "coach"; label: string; hint?: ReactNode }>;
}) {
  const items =
    options ??
    [
      { value: "athlete" as const, label: "Athlete" },
      { value: "coach" as const, label: "Coach" }
    ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-[var(--eos-radius-control)] border px-3 py-2.5 text-sm font-semibold capitalize transition",
            value === item.value
              ? "border-eos-voltline/40 bg-eos-voltline-dim text-eos-voltline shadow-[inset_0_0_0_1px_rgba(200,255,0,0.15)]"
              : "border-eos-outline text-eos-on-surface-muted hover:border-eos-outline-strong hover:text-eos-on-surface"
          )}
        >
          {item.label}
          {item.hint ? (
            <span className="mt-1 block text-left text-[10px] font-normal normal-case text-eos-on-surface-subtle">
              {item.hint}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
