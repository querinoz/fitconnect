"use client";

import { useTheme } from "@/lib/theme/use-theme";
import { THEMES, THEME_IDS } from "@/lib/theme/themes";
import { cn } from "@/lib/utils";

type Variant = "dock" | "settings";

export function ThemePicker({ variant = "dock" }: { variant?: Variant }) {
  const { theme, setTheme } = useTheme();

  if (variant === "dock") {
    return (
      <div className="flex items-center gap-1.5" role="group" aria-label="Theme picker">
        {THEME_IDS.map((id) => {
          const t = THEMES[id];
          const active = id === theme;
          return (
            <button
              key={id}
              type="button"
              aria-label={t.label}
              aria-pressed={active}
              onClick={() => setTheme(id)}
              className={cn(
                "h-3 w-3 rounded-full transition-all",
                active &&
                  "ring-2 ring-offset-2 ring-offset-ink-950 ring-volt-500 scale-110"
              )}
              style={{ background: t.tokens["--volt-500"] }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {THEME_IDS.map((id) => {
        const t = THEMES[id];
        const active = id === theme;
        return (
          <li key={id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(id)}
              className={cn(
                "w-full text-left rounded-glass border p-4 backdrop-blur-glass transition-all",
                active
                  ? "bg-glass-volt border-volt-500/40 shadow-volt-glow"
                  : "bg-glass-md border-glass-border hover:bg-glass-hi"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ background: t.tokens["--volt-500"] }}
                  aria-hidden
                />
                <span className="text-base font-semibold">{t.label}</span>
              </div>
              <p className="text-sm text-ink-300">{t.description}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
