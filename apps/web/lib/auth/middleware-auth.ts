/** Whether middleware should enforce Supabase session cookies on protected routes. */
export function shouldEnforceSupabaseAuth(options: {
  demoMode: boolean;
  supabaseConfigured: boolean;
}): boolean {
  return !options.demoMode && options.supabaseConfigured;
}

export function isDemoModeEnv(value: string | undefined): boolean {
  return value !== "false";
}

export function isSupabaseConfiguredEnv(
  url: string | undefined,
  key: string | undefined
): boolean {
  return Boolean(url && key);
}
