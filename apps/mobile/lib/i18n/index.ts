import type { Dict, Lang } from "./types";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "./types";
import { en } from "./locales/en";
import { pt } from "./locales/pt";

export type { Dict, Lang };
export { DEFAULT_LANG, SUPPORTED_LANGS };

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

function locale(overlay: Record<string, unknown>): Dict {
  return deepMerge(
    structuredClone(en) as Record<string, unknown>,
    overlay
  ) as Dict;
}

export const dict: Record<Lang, Dict> = {
  en,
  pt: locale(pt as Record<string, unknown>)
};

export function isLang(value: string | null | undefined): value is Lang {
  return value != null && (SUPPORTED_LANGS as string[]).includes(value);
}
