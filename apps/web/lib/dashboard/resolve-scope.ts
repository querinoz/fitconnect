import { isDemoModeEnv } from "@/lib/auth/middleware-auth";
import { DEMO_ATHLETE_ID } from "@/lib/dashboard/seed";

export function isLocalDemo(): boolean {
  return isDemoModeEnv(process.env.NEXT_PUBLIC_DEMO_MODE);
}

export function resolveDashboardAthleteId(user: {
  athleteId?: string;
  id?: string;
} | null): string {
  if (user?.athleteId) return user.athleteId;
  if (isLocalDemo()) return DEMO_ATHLETE_ID;
  return user?.id ?? "";
}

export function resolveDashboardCoachId(user: { coachId?: string; id?: string } | null): string {
  if (user?.coachId) return user.coachId;
  if (isLocalDemo()) return "t-001";
  return user?.id ?? "";
}
