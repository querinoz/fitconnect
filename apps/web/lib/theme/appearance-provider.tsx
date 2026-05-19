"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

type ColorMode = "dark" | "light";

type AppearanceContextValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
};

const KEY_COLOR = "fitconnect.colorMode";
const KEY_REDUCE = "fitconnect.reduceMotion";
const KEY_CONTRAST = "fitconnect.highContrast";

export const AppearanceContext = createContext<AppearanceContextValue | null>(
  null
);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>("dark");
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);

  useEffect(() => {
    const savedColor = localStorage.getItem(KEY_COLOR);
    if (savedColor === "light" || savedColor === "dark") {
      setColorModeState(savedColor);
    }

    const savedReduce = localStorage.getItem(KEY_REDUCE);
    if (savedReduce === "1") {
      setReduceMotionState(true);
    } else if (savedReduce === "0") {
      setReduceMotionState(false);
    }

    setHighContrastState(localStorage.getItem(KEY_CONTRAST) === "1");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorMode === "dark");
    root.classList.toggle("light", colorMode === "light");
    root.dataset.colorMode = colorMode;
  }, [colorMode]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "reduced" : "full";
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  }, [reduceMotion, highContrast]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem(KEY_COLOR, mode);
  }, []);

  const setReduceMotion = useCallback((v: boolean) => {
    setReduceMotionState(v);
    localStorage.setItem(KEY_REDUCE, v ? "1" : "0");
  }, []);

  const setHighContrast = useCallback((v: boolean) => {
    setHighContrastState(v);
    localStorage.setItem(KEY_CONTRAST, v ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({
      colorMode,
      setColorMode,
      reduceMotion,
      setReduceMotion,
      highContrast,
      setHighContrast
    }),
    [colorMode, setColorMode, reduceMotion, setReduceMotion, highContrast, setHighContrast]
  );

  return (
    <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
  );
}
