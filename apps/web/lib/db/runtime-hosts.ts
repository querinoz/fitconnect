/**
 * Docker Compose service names that must never be contacted from CI or Vercel.
 * Exact hostname match only — `database.supabase.co` and `my-redis.upstash.io` stay valid.
 */
export const DOCKER_ONLY_HOSTS = [
  "base",
  "db",
  "postgres",
  "mysql",
  "redis"
] as const;

const DOCKER_ONLY = new Set<string>(DOCKER_ONLY_HOSTS);

export function hostnameFromConnectionString(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.includes("://")) {
    try {
      return new URL(v).hostname.toLowerCase();
    } catch {
      return "";
    }
  }
  if (!v.includes("/") && !v.includes("=") && !v.includes(" ")) {
    return v.toLowerCase();
  }
  const kv = /(?:^|[;\s])host\s*=\s*([^\s;]+)/i.exec(v);
  return kv?.[1]?.toLowerCase() ?? "";
}

export function isDockerOnlyHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  return DOCKER_ONLY.has(host);
}

/**
 * True when DATABASE_URL (or a libpq host= value) is safe to open a pool with.
 * `allowDocker` is the explicit local-compose escape hatch (FITCONNECT_ALLOW_DOCKER_DB=1).
 */
export function isRuntimeSafeDatabaseUrl(
  url: string | undefined | null,
  allowDocker = process.env.FITCONNECT_ALLOW_DOCKER_DB === "1"
): boolean {
  const v = url?.trim() ?? "";
  if (!v) return false;
  if (v.toUpperCase().includes("PASTE_") || v.includes("your-")) return false;
  if (allowDocker) return true;
  const host = hostnameFromConnectionString(v);
  if (isDockerOnlyHostname(host)) return false;
  if (!v.includes("://") && isDockerOnlyHostname(v)) return false;
  return true;
}
