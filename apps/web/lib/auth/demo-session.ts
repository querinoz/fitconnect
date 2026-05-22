/** Cookie bridging client demo auth (Zustand) with Edge middleware on hybrid deploys. */
export const DEMO_SESSION_COOKIE = "fc-demo-session";

const BUILTIN_DEMO_IDS = new Set([
  "admin",
  "athlete",
  "coach",
  "coach-demo",
  "athlete-demo",
  "athlete-marina"
]);

export function isAllowedDemoSessionId(id: string | undefined | null): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  if (!trimmed || trimmed.length > 128) return false;
  if (BUILTIN_DEMO_IDS.has(trimmed)) return true;
  return trimmed.startsWith("user-");
}

export function setDemoSessionCookie(userId: string) {
  if (typeof document === "undefined") return;
  if (!isAllowedDemoSessionId(userId)) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEMO_SESSION_COOKIE}=${encodeURIComponent(userId)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

export function clearDemoSessionCookie() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEMO_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
