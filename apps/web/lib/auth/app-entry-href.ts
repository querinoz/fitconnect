import { isDemoModeEnv } from "@/lib/auth/middleware-auth";

/** Marketing/product entry URLs. Production never impersonates via ?demo=. */
export function athleteAppEntryHref(
  demoMode = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE),
): string {
  return demoMode ? "/dashboard?demo=athlete" : "/signin?next=/dashboard";
}

export function coachAppEntryHref(
  demoMode = isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE),
): string {
  return demoMode ? "/coach/dashboard?demo=coach" : "/signin?next=/coach/dashboard";
}
