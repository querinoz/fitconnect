import { pathToFileURL } from "url";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else if (!(key in target)) {
      target[key] = value;
    }
  }
  return target;
}

const { en } = await import(pathToFileURL(join(root, "lib/i18n/locales/en.ts")).href);
const langs = ["pt", "es", "fr", "de", "it"];

for (const lang of langs) {
  const mod = await import(
    pathToFileURL(join(root, `lib/i18n/locales/${lang}.ts`)).href
  );
  const current = mod[lang];
  const merged = deepMerge(structuredClone(current), en);
  const missing = Object.keys(en).filter((k) => !(k in current));
  console.log(`${lang}: added top-level keys: ${missing.join(", ") || "(none)"}`);
  // Only report — manual translation preferred; uncomment to auto-write English fallbacks:
  // writeFileSync(... not safe for ts format
}
