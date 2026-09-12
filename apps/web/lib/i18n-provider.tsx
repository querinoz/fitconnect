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
import { DEFAULT_LANG, dict, loadLocale, SUPPORTED_LANGS, type Dict, type Lang } from "./i18n";

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

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang ?? DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!isLang(saved)) return;
      void loadLocale(saved).then(() => {
        setLangState(saved);
        document.documentElement.lang = saved;
      });
    } catch {
      /* localStorage may be blocked */
    }
  }, []);

  const activeLang = lang;

  const setLang = useCallback((l: Lang) => {
    void loadLocale(l).then(() => {
      setLangState(l);
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
        document.documentElement.lang = l;
      } catch {
        /* ignore */
      }
    });
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
