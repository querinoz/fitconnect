"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-2xl border border-glass-border bg-glass-md text-sm text-ink-100 placeholder:text-ink-500 transition focus:outline-none focus:ring-2 focus:ring-volt-500/40 focus:border-volt-500/30";

export function PremiumInput({
  className,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
          {icon}
        </span>
      ) : null}
      <input
        className={cn(controlClass, "h-11", icon ? "pl-10 pr-3" : "px-3", className)}
        {...props}
      />
    </div>
  );
}

export function PremiumSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, "h-11 px-3", className)} {...props}>
      {children}
    </select>
  );
}

export function FilterChip({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition",
        active
          ? "border-volt-500/40 bg-volt-500/12 text-volt-300"
          : "border-glass-border bg-ink-950/40 text-ink-400 hover:border-white/10 hover:text-ink-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function FilterToggle({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "h-9 rounded-xl border px-2 text-xs capitalize transition",
        active
          ? "border-volt-500/40 bg-volt-500/12 text-volt-300"
          : "border-glass-border bg-ink-950/50 text-ink-300 hover:border-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MagneticToggle<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; badge?: ReactNode }[];
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-glass-border bg-glass-md p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            value === opt.value
              ? "bg-ink-100 text-ink-950 shadow-sm"
              : "text-ink-300 hover:text-ink-100"
          )}
        >
          {opt.label}
          {opt.badge}
        </button>
      ))}
    </div>
  );
}
