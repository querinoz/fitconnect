"use client";

import { Moon, Shield, Sparkles, Sun, Volume2 } from "lucide-react";
import { ThemePicker } from "@/components/shell/theme-picker";
import { PremiumCard } from "@/components/ui-glass/premium-system";
import { useAppearance } from "@/lib/theme/use-appearance";
import { useLocale } from "@/lib/i18n-provider";
import { cn } from "@/lib/utils";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-glass-md px-3 py-2.5",
        disabled && "opacity-50"
      )}
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-ink-100">{label}</span>
        <span className="block text-[10px] text-ink-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-volt-500"
      />
    </label>
  );
}

export function ProfileSettingsPanel({ compact = false }: { compact?: boolean }) {
  const {
    colorMode,
    setColorMode,
    reduceMotion,
    setReduceMotion,
    highContrast,
    setHighContrast
  } = useAppearance();
  const { appearance, accessibility, security } = useLocale().mobileApp;

  return (
    <div className={cn("space-y-3", compact && "text-left")}>
      <PremiumCard tone="volt" className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-volt-400" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-volt-400">
            {appearance.title}
          </p>
        </div>
        <ThemePicker variant="settings" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={colorMode === "dark"}
            onClick={() => setColorMode("dark")}
            className={cn(
              "fc-liquid-glass flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition",
              colorMode === "dark"
                ? "border-volt-500/40 bg-volt-500/15 text-volt-300"
                : "border-glass-border text-ink-400"
            )}
          >
            <Moon className="h-3.5 w-3.5" aria-hidden />
            {appearance.dark}
          </button>
          <button
            type="button"
            aria-pressed={colorMode === "light"}
            onClick={() => setColorMode("light")}
            className={cn(
              "fc-liquid-glass flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition",
              colorMode === "light"
                ? "border-volt-500/40 bg-volt-500/15 text-volt-300"
                : "border-glass-border text-ink-400"
            )}
          >
            <Sun className="h-3.5 w-3.5" aria-hidden />
            {appearance.light}
          </button>
        </div>
      </PremiumCard>

      <PremiumCard className="space-y-2 p-3">
        <div className="mb-1 flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-brand-300" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            {accessibility.title}
          </p>
        </div>
        <ToggleRow
          label={accessibility.reduceMotion}
          description={accessibility.reduceMotionDesc}
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
        <ToggleRow
          label={accessibility.highContrast}
          description={accessibility.highContrastDesc}
          checked={highContrast}
          onChange={setHighContrast}
        />
      </PremiumCard>

      <PremiumCard className="space-y-2 p-3">
        <div className="mb-1 flex items-center gap-2">
          <Shield className="h-4 w-4 text-plasma-300" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            {security.title}
          </p>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-glass-border bg-glass-md px-3 py-2 text-left text-xs font-semibold text-ink-200"
        >
          {security.wearables}
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-glass-border bg-glass-md px-3 py-2 text-left text-xs font-semibold text-ink-200"
        >
          {security.dataExport}
        </button>
        <p className="text-[10px] leading-5 text-ink-500">{security.demoNote}</p>
      </PremiumCard>
    </div>
  );
}
