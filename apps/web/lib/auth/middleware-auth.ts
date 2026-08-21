export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/coach",
  "/sessions",
  "/inbox",
  "/my-coach",
  "/profile",
  "/settings",
  "/admin",
  "/insights",
  "/achievements",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Whether middleware should require a Firebase ID cookie on protected routes. */
export function shouldEnforceFirebaseAuth(options: {
  demoMode: boolean;
  firebaseConfigured: boolean;
}): boolean {
  return !options.demoMode && options.firebaseConfigured;
}

/** @deprecated Identity is Firebase Auth. Kept for existing tests; use shouldEnforceFirebaseAuth. */
export function shouldEnforceSupabaseAuth(options: {
  demoMode: boolean;
  supabaseConfigured: boolean;
}): boolean {
  return shouldEnforceFirebaseAuth({
    demoMode: options.demoMode,
    firebaseConfigured: options.supabaseConfigured,
  });
}

export function hasValidDemoSessionCookie(
  cookieValue: string | undefined | null,
  isAllowedId: (id: string) => boolean
): boolean {
  if (!cookieValue) return false;
  try {
    const id = decodeURIComponent(cookieValue.trim());
    return isAllowedId(id);
  } catch {
    return false;
  }
}

export function hasFirebaseSessionCookie(cookieValue: string | undefined | null): boolean {
  return Boolean(cookieValue && cookieValue.split(".").length === 3);
}

/** Fail-closed: demo only when explicitly set to "true". */
export function isDemoModeEnv(value: string | undefined): boolean {
  return value === "true";
}

export function isFirebaseConfiguredEnv(complete: boolean): boolean {
  return complete;
}

export function isSupabaseConfiguredEnv(
  url: string | undefined,
  key: string | undefined
): boolean {
  return Boolean(url && key);
}
