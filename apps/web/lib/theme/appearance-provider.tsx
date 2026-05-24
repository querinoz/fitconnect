"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  MOTION_STORAGE_KEY,
  parseStoredMotion,
  resolveEffectiveReduced,
  type MotionPreference
} from "@fitconnect/design-tokens/src/motion-policy";

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
const KEY_REDUCE_LEGACY = "fitconnect.reduceMotion";
const KEY_CONTRAST = "fitconnect.highContrast";

function readMotionOverride(): MotionPreference {
  const stored = parseStoredMotion(localStorage.getItem(MOTION_STORAGE_KEY));
  if (stored) return stored;
  const legacy = localStorage.getItem(KEY_REDUCE_LEGACY);
  if (legacy === "1") return "reduced";
  if (legacy === "0") return "full";
  return null;
}

function applyMotionDataset(reduced: boolean) {
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
}

export const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>("dark");
  const [motionOverride, setMotionOverride] = useState<MotionPreference>(null);
  const [osReduced, setOsReduced] = useState(false);
  const [highContrast, setHighContrastState] = useState(false);

  const reduceMotion = resolveEffectiveReduced(osReduced, motionOverride);

  useEffect(() => {
    const savedColor = localStorage.getItem(KEY_COLOR);
    if (savedColor === "light" || savedColor === "dark") {
      setColorModeState(savedColor);
    }
    setMotionOverride(readMotionOverride());
    setHighContrastState(localStorage.getItem(KEY_CONTRAST) === "1");

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setOsReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorMode === "dark");
    root.classList.toggle("light", colorMode === "light");
    root.dataset.colorMode = colorMode;
  }, [colorMode]);

  useEffect(() => {
    applyMotionDataset(reduceMotion);
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
  }, [reduceMotion, highContrast]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem(KEY_COLOR, mode);
  }, []);

  const setReduceMotion = useCallback((v: boolean) => {
    const next: MotionPreference = v ? "reduced" : "full";
    setMotionOverride(next);
    localStorage.setItem(MOTION_STORAGE_KEY, next);
    localStorage.setItem(KEY_REDUCE_LEGACY, v ? "1" : "0");
    applyMotionDataset(resolveEffectiveReduced(osReduced, next));
  }, [osReduced]);

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

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}
