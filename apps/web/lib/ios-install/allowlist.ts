const TESTFLIGHT_HOST = "testflight.apple.com";
const JOIN_PATH = /^\/join\/[A-Za-z0-9]{6,32}$/;

const BLOCKED_HOSTS = new Set(["localhost", "localhost.", "0.0.0.0", "::1", "[::1]"]);

function isPrivateIpv4(hostname: string): boolean {
  const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const oct = m.slice(1).map((n) => Number(n));
  if (oct.some((n) => n > 255)) return false;
  const [a, b] = oct;
  if (a === 10 || a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.replace(/\.+$/, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost")) return true;
  if (host.includes(":")) return true;
  return isPrivateIpv4(host);
}

/**
 * Fail-closed TestFlight join URL validator.
 * Only https://testflight.apple.com/join/{code} is accepted.
 */
export function parseAllowedTestFlightUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:") ||
    lower.startsWith("about:")
  ) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (parsed.port && parsed.port !== "443") return null;
  if (parsed.search || parsed.hash) return null;
  if (parsed.hostname !== TESTFLIGHT_HOST) return null;
  if (isBlockedHost(parsed.hostname)) return null;
  if (!JOIN_PATH.test(parsed.pathname)) return null;
  const canonical = `https://${TESTFLIGHT_HOST}${parsed.pathname}`;
  if (trimmed !== canonical) return null;
  return canonical;
}

export function isAllowedTestFlightUrl(raw: string | undefined | null): boolean {
  return parseAllowedTestFlightUrl(raw) !== null;
}

export const OFFICIAL_TESTFLIGHT_APP_URL =
  "https://apps.apple.com/app/testflight/id899247664";

export const IOS_INSTALL_PATH = "/ios/install";
