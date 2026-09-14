/**
 * Merge GitHub production secrets into Vercel-pulled env files and drop
 * placeholder hosts that break `vercel build` (seen as `getaddrinfo EAI_AGAIN base`
 * after Next compiled — a leftover `http://base` / `TURBO_API=base` style value).
 *
 * Never prints secret values.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const TURBO_REMOTE_KEYS = new Set([
  "TURBO_API",
  "TURBO_TOKEN",
  "TURBO_TEAM",
  "TURBO_REMOTE_CACHE_SIGNATURE_KEY"
]);

export const PLACEHOLDER_HOSTS = new Set([
  "base",
  "db",
  "postgres",
  "mysql",
  "redis",
  "example.com",
  "example.org",
  "placeholder",
  "changeme"
]);

export const PLACEHOLDER_VALUES = new Set([
  "base",
  "changeme",
  "todo",
  "undefined",
  "null",
  "paste_here"
]);

const REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
];

const OPTIONAL = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PRICE_ATHLETE_MONTHLY",
  "STRIPE_PRICE_ATHLETE_ANNUAL",
  "STRIPE_PRICE_TEAM_MONTHLY",
  "STRIPE_PRICE_TEAM_ANNUAL",
  "STRIPE_PRICE_COACH_MONTHLY",
  "STRIPE_PRICE_COACH_ANNUAL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "NEXT_PUBLIC_SENTRY_DSN",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET",
  "NEXT_PUBLIC_LIVEKIT_URL",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_CONVEX_URL"
];

const PRODUCTION_APP_URL = "https://fitconnect-phi.vercel.app";

/** Never SSG against GitHub Actions DNS for docker compose hosts (`base`, `db`). Runtime still uses Vercel project env. */
export const BUILD_OMIT_DB_KEYS = new Set([
  "DATABASE_URL",
  "DIRECT_URL",
  "PGHOST",
  "POSTGRES_HOST",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL"
]);

function unquote(raw) {
  const v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

export function hostnameOf(value) {
  const v = value.trim();
  if (!v.includes("://")) return "";
  try {
    return new URL(v).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function connectionHosts(value) {
  const hosts = [];
  const v = value.trim();
  const urlHost = hostnameOf(v);
  if (urlHost) hosts.push(urlHost);
  try {
    if (v.includes("://")) {
      const paramHost = new URL(v).searchParams.get("host");
      if (paramHost) hosts.push(paramHost.toLowerCase());
    }
  } catch {
    /* ignore */
  }
  const kv = /(?:^|[;\s])host\s*=\s*([^\s;]+)/i.exec(v);
  if (kv?.[1]) hosts.push(kv[1].toLowerCase());
  return hosts;
}

export function isPlaceholderValue(key, value) {
  const v = value.trim();
  if (!v) return true;
  if (PLACEHOLDER_VALUES.has(v.toLowerCase())) return true;
  if (v.toUpperCase().includes("PASTE_")) return true;
  if (TURBO_REMOTE_KEYS.has(key)) return true;
  if (BUILD_OMIT_DB_KEYS.has(key)) return true;
  if (connectionHosts(v).some((host) => PLACEHOLDER_HOSTS.has(host))) return true;
  if (!v.includes("://") && PLACEHOLDER_HOSTS.has(v.toLowerCase())) return true;
  return false;
}

function parseEnvText(text) {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = unquote(trimmed.slice(eq + 1));
    map.set(key, value);
  }
  return map;
}

function serializeEnv(map) {
  const lines = [];
  for (const [key, value] of map) {
    const escaped = value.replaceAll("\n", "").replaceAll("\r", "");
    lines.push(`${key}=${escaped}`);
  }
  return `${lines.join("\n")}\n`;
}

/**
 * @param {string} text
 * @param {NodeJS.ProcessEnv} env
 */
export function mergeAndSanitizeEnv(text, env = process.env) {
  const map = parseEnvText(text);

  for (const key of TURBO_REMOTE_KEYS) {
    map.delete(key);
  }
  for (const key of BUILD_OMIT_DB_KEYS) {
    map.delete(key);
  }

  for (const [key, value] of [...map.entries()]) {
    if (isPlaceholderValue(key, value)) {
      map.delete(key);
    }
  }

  for (const key of REQUIRED) {
    const value = env[key]?.trim() ?? "";
    if (!value) {
      throw new Error(`missing ${key}`);
    }
    map.set(key, value);
  }

  let injectedOptional = 0;
  for (const key of OPTIONAL) {
    const value = env[key]?.trim() ?? "";
    if (!value || isPlaceholderValue(key, value)) continue;
    map.set(key, value);
    injectedOptional += 1;
  }

  const appUrl = map.get("NEXT_PUBLIC_APP_URL")?.trim() ?? "";
  if (!appUrl || isPlaceholderValue("NEXT_PUBLIC_APP_URL", appUrl) || !hostnameOf(appUrl)) {
    map.set("NEXT_PUBLIC_APP_URL", PRODUCTION_APP_URL);
  }

  const convex = map.get("NEXT_PUBLIC_CONVEX_URL")?.trim() ?? "";
  if (convex) {
    try {
      const parsed = new URL(convex);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        map.delete("NEXT_PUBLIC_CONVEX_URL");
      } else if (PLACEHOLDER_HOSTS.has(parsed.hostname.toLowerCase())) {
        map.delete("NEXT_PUBLIC_CONVEX_URL");
      }
    } catch {
      map.delete("NEXT_PUBLIC_CONVEX_URL");
    }
  }

  return { text: serializeEnv(map), injectedOptional, keys: [...map.keys()] };
}

export function envFilePaths(cwd = process.cwd()) {
  return [
    path.join(cwd, ".vercel", ".env.production.local"),
    path.join(cwd, "apps", "web", ".vercel", ".env.production.local")
  ];
}

export function injectGithubSecretsIntoVercelEnv(cwd = process.cwd(), env = process.env) {
  let injectedOptional = 0;
  const written = [];
  for (const filePath of envFilePaths(cwd)) {
    const existing = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, "utf8")
      : "";
    const result = mergeAndSanitizeEnv(existing, env);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, result.text, "utf8");
    injectedOptional += result.injectedOptional;
    written.push({ path: path.relative(cwd, filePath).replaceAll("\\", "/"), keys: result.keys.length });
  }
  return { injectedOptional, written };
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const result = injectGithubSecretsIntoVercelEnv();
  const first = envFilePaths()[0];
  const keys = fs.existsSync(first)
    ? fs
        .readFileSync(first, "utf8")
        .split(/\r?\n/)
        .map((ln) => ln.split("=")[0]?.trim())
        .filter(Boolean)
        .filter((k) => !k.startsWith("#"))
    : [];
  console.log(
    `injected ${REQUIRED.length} required Firebase keys; ` +
      `${result.injectedOptional} optional secret slots were non-empty ` +
      `(counted across ${result.written.length} env files); ` +
      `DATABASE_URL omitted from CLI build; remaining keys: ${keys.join(",")}`
  );
}
