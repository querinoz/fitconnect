"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { DEFAULT_LANG, dict, type Lang } from "./i18n";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: <K1 extends keyof typeof dict.en, K2 extends keyof (typeof dict.en)[K1]>(
    group: K1,
    key: K2
  ) => (typeof dict.en)[K1][K2];
}

const STORAGE_KEY = "fitconnect.lang";

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved && (saved === "en" || saved === "pt")) {
        setLangState(saved);
        document.documentElement.lang = saved;
        return;
      }
      const navLang = (navigator.language || "").toLowerCase();
      if (navLang.startsWith("pt")) {
        setLangState("pt");
        document.documentElement.lang = "pt";
      }
    } catch {
      /* localStorage may be blocked */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback<LanguageContextValue["t"]>(
    (group, key) => dict[lang][group][key],
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: ((group: keyof typeof dict.en, key: string) =>
        // @ts-expect-error fallback access — only used when provider is missing
        dict[DEFAULT_LANG][group][key]) as LanguageContextValue["t"]
    };
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
