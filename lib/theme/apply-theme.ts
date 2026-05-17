import { THEMES, isThemeId, type ThemeId } from "./themes";

export function applyTheme(id: ThemeId): void {
  if (typeof document === "undefined") return;
  if (!isThemeId(id)) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(THEMES[id].tokens)) {
    root.style.setProperty(k, v);
  }
  root.dataset.theme = id;
}
