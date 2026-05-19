import type { Dict, Lang } from "./types";
import { DEFAULT_LANG, LANGS, SUPPORTED_LANGS } from "./types";
import { en } from "./locales/en";
import { pt } from "./locales/pt";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { de } from "./locales/de";
import { it } from "./locales/it";

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

/** Locale files may ship partial keys; English fills any gaps. */
function locale(overlay: Record<string, unknown>): Dict {
  return deepMerge(
    structuredClone(en) as Record<string, unknown>,
    overlay
  ) as Dict;
}

export const dict: Record<Lang, Dict> = {
  en,
  pt: locale(pt),
  es: locale(es),
  fr: locale(fr),
  de: locale(de),
  it: locale(it)
};
