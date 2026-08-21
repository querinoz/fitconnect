/** Demo-mode path → role. LOCAL_DEMO only — not production identity. */

export const ATHLETE_APP_PREFIXES = [
  "/dashboard",
  "/insights",
  "/achievements",
  "/sessions",
  "/inbox",
  "/my-coach",
  "/profile",
  "/settings",
  "/map",
] as const;

export function isAthleteAppPath(pathname: string): boolean {
  return ATHLETE_APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isCoachAppPath(pathname: string): boolean {
  return pathname === "/coach" || pathname.startsWith("/coach/");
}

export type DemoRole = "athlete" | "coach";

/**
 * `?demo=1` follows the path: coach routes stay coach, everything else athlete.
 * Explicit `?demo=coach|athlete` always wins over path.
 */
export function demoRoleForPath(
  pathname: string,
  demoParam: string | null,
): DemoRole | null {
  if (demoParam === "coach") return "coach";
  if (demoParam === "athlete") return "athlete";
  if (isCoachAppPath(pathname)) return "coach";
  if (isAthleteAppPath(pathname)) return "athlete";
  if (demoParam === "1") return "athlete";
  return null;
}
