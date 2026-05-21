import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { cache } from "@/lib/cache";
import { DEFAULT_LANG, dict, isLang, type Dict, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "fitconnect.lang";

function detectDeviceLang(): Lang {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale?.toLowerCase() ?? "";
    if (locale.startsWith("pt")) return "pt";
  } catch {
    /* ignore */
  }
  return DEFAULT_LANG;
}

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  locale: Dict;
  t: <G extends keyof Dict, K extends keyof Dict[G]>(group: G, key: K) => Dict[G][K];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = cache.getString(STORAGE_KEY);
    if (isLang(saved)) return saved;
    return detectDeviceLang();
  });

  useEffect(() => {
    const saved = cache.getString(STORAGE_KEY);
    if (isLang(saved)) {
      setLangState(saved);
      return;
    }
    const detected = detectDeviceLang();
    setLangState(detected);
    cache.set(STORAGE_KEY, detected);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    cache.set(STORAGE_KEY, l);
  }, []);

  const locale = dict[lang];

  const t = useCallback<LanguageContextValue["t"]>(
    (group, key) => dict[lang][group][key],
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, locale, t }),
    [lang, setLang, locale, t]
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
        dict[DEFAULT_LANG][group][key as keyof Dict[typeof group]]) as LanguageContextValue["t"]
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
