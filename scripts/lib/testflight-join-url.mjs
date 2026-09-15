/**
 * Fail-closed TestFlight public join URL parser (CI / Node, no Next import).
 * Must stay aligned with apps/web/lib/ios-install/allowlist.ts.
 */
const TESTFLIGHT_HOST = "testflight.apple.com";
const JOIN_PATH = /^\/join\/[A-Za-z0-9]{6,32}$/;

export function parseAllowedTestFlightUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
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
  let parsed;
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
  if (!JOIN_PATH.test(parsed.pathname)) return null;
  const canonical = `https://${TESTFLIGHT_HOST}${parsed.pathname}`;
  if (trimmed !== canonical) return null;
  return canonical;
}

export function isAllowedTestFlightUrl(raw) {
  return parseAllowedTestFlightUrl(raw) !== null;
}
