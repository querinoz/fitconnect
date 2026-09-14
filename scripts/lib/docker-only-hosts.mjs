/** Keep in sync with apps/web/lib/db/runtime-hosts.ts */
export const DOCKER_ONLY_HOSTS = new Set(["base", "db", "postgres", "mysql", "redis"]);

export function hostnameFromConnectionString(value) {
  const v = String(value ?? "").trim();
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

export function isDockerOnlyHostname(hostname) {
  return DOCKER_ONLY_HOSTS.has(String(hostname ?? "").trim().toLowerCase());
}

export function isDockerOnlyConnectionValue(value) {
  const v = String(value ?? "").trim();
  if (!v) return false;
  const host = hostnameFromConnectionString(v);
  if (host && isDockerOnlyHostname(host)) return true;
  if (!v.includes("://") && isDockerOnlyHostname(v)) return true;
  return false;
}
