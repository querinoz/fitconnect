"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";
import { applyTheme } from "./apply-theme";

type ThemeContextValue = {
  theme: ThemeId;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  matchCoach: boolean;
  setMatchCoach: (v: boolean) => void;
  coachTheme: ThemeId | null;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const KEY_THEME = "fitconnect.theme";
const KEY_MATCH = "fitconnect.theme.matchCoach";

export function ThemeProvider({
  children,
  coachTheme = null,
  /** Test / storybook overrides only */
  forceThemeId,
  forceMatchCoach
}: {
  children: ReactNode;
  coachTheme?: ThemeId | null;
  forceThemeId?: ThemeId;
  forceMatchCoach?: boolean;
}) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
  const [matchCoach, setMatchCoachState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_THEME);
    const resolved =
      forceThemeId ?? (saved && isThemeId(saved) ? saved : DEFAULT_THEME);
    setThemeIdState(resolved);
    setMatchCoachState(
      forceMatchCoach ?? localStorage.getItem(KEY_MATCH) === "1"
    );
    setHydrated(true);
  }, [forceThemeId, forceMatchCoach]);

  const resolvedThemeId: ThemeId =
    (matchCoach && coachTheme !== null ? coachTheme : themeId);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(resolvedThemeId);
  }, [resolvedThemeId, hydrated]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedThemeId,
      themeId,
      setTheme: (id) => {
        setThemeIdState(id);
        localStorage.setItem(KEY_THEME, id);
      },
      matchCoach,
      setMatchCoach: (v) => {
        setMatchCoachState(v);
        localStorage.setItem(KEY_MATCH, v ? "1" : "0");
      },
      coachTheme
    }),
    [resolvedThemeId, themeId, matchCoach, coachTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
