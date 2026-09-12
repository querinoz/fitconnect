import type { Dict, Lang } from "./types";
import { DEFAULT_LANG, LANGS, SUPPORTED_LANGS } from "./types";
import { en } from "./locales/en";
import { pt } from "./locales/pt";

export type { Dict, Lang };
export { DEFAULT_LANG, LANGS, SUPPORTED_LANGS };

function deepMerge<T extends Record<string, unknown>>(base: T, overlay: T): T {
  const out = { ...base };
  for (const key of Object.keys(overlay) as (keyof T)[]) {
    const b = base[key];
    const o = overlay[key];
    if (
      o &&
      typeof o === "object" &&
      !Array.isArray(o) &&
      b &&
      typeof b === "object" &&
      !Array.isArray(b)
    ) {
      out[key] = deepMerge(
        b as Record<string, unknown>,
        o as Record<string, unknown>
      ) as T[keyof T];
    } else {
      out[key] = o;
    }
  }
  return out;
}

/** Locale files ship partial keys; English fills any gaps. */
function locale(overlay: Record<string, unknown>): Dict {
  return deepMerge(
    structuredClone(en) as Record<string, unknown>,
    overlay
  ) as Dict;
}

const ptMerged = locale(pt as unknown as Record<string, unknown>);

/**
 * Eager languages are the SSR default (pt) plus English fallback.
 * es/fr/de/it overlays load on demand so `/` does not parse six full dictionaries.
 */
const cache: Record<Lang, Dict> = {
  en,
  pt: ptMerged,
  es: en,
  fr: en,
  de: en,
  it: en
};

export const dict: Record<Lang, Dict> = cache;

const overlayLoaders: Record<Exclude<Lang, "en">, () => Promise<Record<string, unknown>>> = {
  pt: () => Promise.resolve(pt as unknown as Record<string, unknown>),
  es: () => import("./locales/es").then((m) => m.es as Record<string, unknown>),
  fr: () => import("./locales/fr").then((m) => m.fr as Record<string, unknown>),
  de: () => import("./locales/de").then((m) => m.de as Record<string, unknown>),
  it: () => import("./locales/it").then((m) => m.it as Record<string, unknown>)
};

export async function loadLocale(lang: Lang): Promise<Dict> {
  if (lang === "en") return en;
  if (lang === "pt") return ptMerged;
  if (cache[lang] !== en) return cache[lang];
  const overlay = await overlayLoaders[lang]();
  const merged = locale(overlay);
  cache[lang] = merged;
  return merged;
}
