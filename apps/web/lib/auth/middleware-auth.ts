/** Whether middleware should enforce Supabase session cookies on protected routes. */
export function shouldEnforceSupabaseAuth(options: {
  demoMode: boolean;
  supabaseConfigured: boolean;
}): boolean {
  return !options.demoMode && options.supabaseConfigured;
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

/** Fail-closed: demo only when explicitly set to "true". */
export function isDemoModeEnv(value: string | undefined): boolean {
  return value === "true";
}

export function isSupabaseConfiguredEnv(
  url: string | undefined,
  key: string | undefined
): boolean {
  return Boolean(url && key);
}
