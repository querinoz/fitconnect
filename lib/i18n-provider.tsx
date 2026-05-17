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
import { DEFAULT_LANG, dict, SUPPORTED_LANGS, type Dict, type Lang } from "./i18n";
import { useMounted } from "./use-mounted";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  locale: Dict;
  t: <K1 extends keyof Dict, K2 extends keyof (typeof dict.en)[K1]>(
    group: K1,
    key: K2
  ) => (typeof dict.en)[K1][K2];
}

const STORAGE_KEY = "fitconnect.lang";

function isLang(value: string | null): value is Lang {
  return value !== null && (SUPPORTED_LANGS as string[]).includes(value);
}

function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("it")) return "it";
  return "en";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) {
        setLangState(saved);
        document.documentElement.lang = saved;
        return;
      }
      const detected = detectBrowserLang();
      setLangState(detected);
      document.documentElement.lang = detected;
    } catch {
      /* localStorage may be blocked */
    }
  }, []);

  /** Match SSR until mounted — avoids hydration text mismatches from saved locale. */
  const activeLang = mounted ? lang : DEFAULT_LANG;

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  }, []);

  const locale = dict[activeLang];

  const t = useCallback<LanguageContextValue["t"]>(
    (group, key) => dict[activeLang][group][key],
    [activeLang]
  );

  const value = useMemo(
    () => ({ lang: activeLang, setLang, locale, t }),
    [activeLang, setLang, locale, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    const locale = dict[DEFAULT_LANG];
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      locale,
      t: ((group: keyof Dict, key: string) =>
        // @ts-expect-error fallback when provider missing
        dict[DEFAULT_LANG][group][key]) as LanguageContextValue["t"]
    };
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export function useLocale() {
  return useLanguage().locale;
}

/** Replace `{key}` placeholders in translated templates. */
export function formatMsg(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    template
  );
}
