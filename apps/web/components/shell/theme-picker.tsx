"use client";

import { useTheme } from "@/lib/theme/use-theme";
import { THEMES, THEME_IDS, type ThemeId } from "@/lib/theme/themes";
import { cn } from "@/lib/utils";

/** Per-theme orbit accent — inspired by uiverse good-chicken-7 */
const THEME_ACCENT: Record<ThemeId, string> = {
  voltline: "#C8FF00",
  pulse: "#FF5470",
  tide: "#00DDB4",
  solar: "#FFB020",
  aurora: "#9466FF"
};

type Variant = "dock" | "settings";

function OrbitRadio({
  id,
  label,
  description,
  accent,
  active,
  onSelect,
  compact = false
}: {
  id: ThemeId;
  label: string;
  description?: string;
  accent: string;
  active: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <label
      className={cn("fc-theme-radio-label group", compact && "fc-theme-radio-label--compact")}
      style={{ ["--theme-accent" as string]: accent }}
    >
      <input
        type="radio"
        name="fc-theme"
        className="fc-theme-radio-input"
        checked={active}
        onChange={onSelect}
        aria-label={label}
      />
      <span className="fc-theme-radio-custom" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="fc-theme-radio-text">{label}</span>
        {description && !compact ? (
          <span className="mt-0.5 block text-xs text-ink-500">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function ThemePicker({ variant = "dock" }: { variant?: Variant }) {
  const { theme, setTheme } = useTheme();

  if (variant === "dock") {
    return (
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Theme picker">
        {THEME_IDS.map((id) => {
          const t = THEMES[id];
          const active = id === theme;
          return (
            <label
              key={id}
              className="fc-theme-radio-label fc-theme-radio-label--dock group"
              style={{ ["--theme-accent" as string]: THEME_ACCENT[id] }}
              title={t.label}
            >
              <input
                type="radio"
                name="fc-theme-dock"
                className="fc-theme-radio-input"
                checked={active}
                onChange={() => setTheme(id)}
                aria-label={t.label}
              />
              <span className="fc-theme-radio-custom fc-theme-radio-custom--dock" aria-hidden />
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="fc-theme-radio-group"
      role="radiogroup"
      aria-label="Accent theme"
    >
      {THEME_IDS.map((id) => {
        const t = THEMES[id];
        return (
          <OrbitRadio
            key={id}
            id={id}
            label={t.label}
            description={t.description}
            accent={THEME_ACCENT[id]}
            active={id === theme}
            onSelect={() => setTheme(id)}
          />
        );
      })}
    </div>
  );
}
