import { DOCKER_ONLY_HOSTS } from "./lib/docker-only-hosts.mjs";

export function hostnameFromGetaddrinfo(log) {
  const text = String(log ?? "");
  const m =
    /getaddrinfo\s+EAI_AGAIN\s+([A-Za-z0-9._-]+)/.exec(text) ||
    /EAI_AGAIN\s+([A-Za-z0-9._-]+)/.exec(text);
  return m?.[1]?.toLowerCase() ?? "";
}

/**
 * @returns {{ kind: "deterministic" | "transient", retry: boolean, hostname?: string, reason: string }}
 */
export function classifyVercelBuildLog(log) {
  const text = String(log ?? "");
  const hostname = hostnameFromGetaddrinfo(text);

  if (hostname && DOCKER_ONLY_HOSTS.has(hostname)) {
    return {
      kind: "deterministic",
      retry: false,
      hostname,
      reason: `docker-only hostname ${hostname} — fix env/SSG, do not retry`
    };
  }

  if (
    /Failed to compile|Type error|TS\d{4}|SyntaxError|ELIFECYCLE|Invalid (next\.config|configuration)|Module not found/i.test(
      text
    )
  ) {
    return { kind: "deterministic", retry: false, hostname, reason: "application or configuration error" };
  }

  if (/missing .*(VERCEL_TOKEN|FIREBASE|secret)/i.test(text)) {
    return { kind: "deterministic", retry: false, reason: "missing required secret" };
  }

  if (
    /EAI_AGAIN|ECONNRESET|ETIMEDOUT|ENETUNREACH|socket hang up|503 Service Unavailable|ECONNREFUSED/i.test(
      text
    )
  ) {
    return {
      kind: "transient",
      retry: true,
      hostname: hostname || undefined,
      reason: "transient DNS or network"
    };
  }

  return { kind: "deterministic", retry: false, hostname, reason: "unclassified build failure" };
}

export function backoffMs(attempt) {
  return 5_000 * 3 ** (attempt - 1);
}
