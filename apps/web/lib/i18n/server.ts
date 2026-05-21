import { cookies, headers } from "next/headers";
import { dict, type Dict, type Lang, DEFAULT_LANG, SUPPORTED_LANGS } from "./index";

const STORAGE_KEY = "fitconnect.lang";

function isLang(value: string | undefined | null): value is Lang {
  return value !== undefined && value !== null && (SUPPORTED_LANGS as string[]).includes(value);
}

/** Resolve locale from cookie, then Accept-Language, then default. */
export function resolveLang(cookieValue?: string | null, acceptLanguage?: string | null): Lang {
  if (isLang(cookieValue)) return cookieValue;

  const nav = (acceptLanguage || "").toLowerCase();
  if (nav.startsWith("pt")) return "pt";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("it")) return "it";
  if (nav.startsWith("en")) return "en";

  return DEFAULT_LANG;
}

/** Server-side dictionary lookup. */
export function getDictionary(lang: Lang): Dict {
  return dict[lang];
}

/** Read lang from Next.js request context (RSC / generateMetadata). */
export async function getServerLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return resolveLang(
    cookieStore.get(STORAGE_KEY)?.value,
    headerStore.get("accept-language")
  );
}

export { STORAGE_KEY };
