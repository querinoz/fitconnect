import { readFileSync } from "fs";
import { pathToFileURL } from "url";

const langs = ["en", "pt", "es", "fr", "de", "it"];

async function load(lang) {
  const m = await import(pathToFileURL(`../lib/i18n/locales/${lang}.ts`).href);
  return m[lang];
}

function leafKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...leafKeys(v, p));
    } else {
      keys.push(p);
    }
  }
  return keys;
}

const dicts = {};
for (const lang of langs) {
  dicts[lang] = await load(lang);
}
const enKeys = leafKeys(dicts.en);
for (const lang of langs) {
  if (lang === "en") continue;
  const missing = enKeys.filter((k) => !leafKeys(dicts[lang]).includes(k));
  console.log(`${lang}: ${missing.length} missing keys`);
  if (missing.length) console.log(missing.join("\n"));
}
