/**
 * Fail closed BEFORE `vercel build` if pulled env still points at Docker Compose hosts.
 * Never prints values (credentials live in these files).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isDockerOnlyConnectionValue, isDockerOnlyHostname } from "./lib/docker-only-hosts.mjs";
import { BUILD_OMIT_DB_KEYS, envFilePaths } from "./inject-github-secrets-into-vercel-env.mjs";

const SCAN_PROCESS_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "PGHOST",
  "POSTGRES_HOST",
  "POSTGRES_URL",
  "PRISMA_DATABASE_URL",
  "REDIS_URL",
  "TURBO_API",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_SUPABASE_URL"
];

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

export function parseEnvText(text) {
  /** @type {Array<{ key: string, value: string }>} */
  const rows = [];
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    rows.push({
      key: trimmed.slice(0, eq).trim(),
      value: unquote(trimmed.slice(eq + 1))
    });
  }
  return rows;
}

export function findingsInEnvRows(rows, source, envClass = "vercel-prebuild") {
  /** @type {Array<{ source: string, key: string, reason: string }>} */
  const findings = [];
  for (const { key, value } of rows) {
    if (!value) continue;
    if (isDockerOnlyConnectionValue(value) || isDockerOnlyHostname(value)) {
      findings.push({
        source,
        key,
        reason: "docker-only hostname (exact match: base/db/postgres/mysql/redis)"
      });
      continue;
    }
    if (envClass === "vercel-prebuild" && BUILD_OMIT_DB_KEYS.has(key)) {
      findings.push({
        source,
        key,
        reason: "database URL present in Vercel prebuild env; runtime Vercel env must supply it instead"
      });
    }
  }
  return findings;
}

export function preflightVercelEnv(cwd = process.cwd(), env = process.env, envClass = "vercel-prebuild") {
  const findings = [];
  const files = [...envFilePaths(cwd)];
  const seen = new Set();
  for (const filePath of files) {
    const rel = path.relative(cwd, filePath).replaceAll("\\", "/");
    if (seen.has(rel)) continue;
    seen.add(rel);
    if (!fs.existsSync(filePath)) continue;
    const rows = parseEnvText(fs.readFileSync(filePath, "utf8"));
    findings.push(...findingsInEnvRows(rows, rel, envClass));
  }
  const processRows = SCAN_PROCESS_KEYS.map((key) => ({
    key,
    value: env[key] ?? ""
  }));
  findings.push(...findingsInEnvRows(processRows, "process.env", envClass));
  return findings;
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const findings = preflightVercelEnv();
  if (findings.length) {
    console.error("::error::Vercel prebuild env still contains Docker-only or build-unsafe database hosts.");
    for (const f of findings) {
      console.error(`DETERMINISTIC: ${f.source} ${f.key} — ${f.reason}`);
    }
    console.error("Fix: omit DATABASE_URL/DIRECT_URL/PGHOST from CLI `vercel build`; never point production env at hostname `base`.");
    process.exit(1);
  }
  console.log("preflight-vercel-env: no docker-only hosts in pulled env or process.env");
}
