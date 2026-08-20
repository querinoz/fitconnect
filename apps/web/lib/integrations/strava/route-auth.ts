import {
  isAuthFailure,
  requireAthleteId,
  requireCoachId,
  type AuthFailure
} from "@/lib/api/require-auth";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

function fromAuthFailure(
  failure: AuthFailure,
  mismatch: "athlete_mismatch" | "coach_mismatch"
): { error: string; status: number } {
  const status = failure.response.status;
  if (status === 403) return { error: mismatch, status };
  if (status === 503) return { error: "auth_not_configured", status };
  return { error: "unauthorized", status };
}

/** Resolve athlete id for integration routes — demo permissive; prod binds to Firebase UID. */
export async function resolveIntegrationAthlete(
  request: Request,
  paramId?: string | null
): Promise<{ athleteId: string } | { error: string; status: number }> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("athleteId");

  if (isDemoMode()) {
    return { athleteId: fromParam ?? "a-ines" };
  }

  const headerId = request.headers.get("x-athlete-id");
  const authSecret = process.env.INTEGRATION_AUTH_SECRET;
  const authHeader = request.headers.get("authorization");
  const bearerOk =
    Boolean(authSecret) && authHeader === `Bearer ${authSecret}` && Boolean(headerId);

  if (bearerOk && headerId) {
    return { athleteId: headerId };
  }

  const result = await requireAthleteId(request, paramId);
  if (isAuthFailure(result)) {
    return fromAuthFailure(result, "athlete_mismatch");
  }
  return { athleteId: result.athleteId };
}

export async function resolveIntegrationCoach(
  request: Request,
  paramId?: string | null
): Promise<{ coachId: string } | { error: string; status: number }> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("coachId");

  if (isDemoMode()) {
    return { coachId: fromParam ?? "t-002" };
  }

  const result = await requireCoachId(request, paramId);
  if (isAuthFailure(result)) {
    return fromAuthFailure(result, "coach_mismatch");
  }
  return { coachId: result.coachId };
}

/**
 * Job auth is a shared machine secret only. Presence of `upstash-signature`
 * is not verification — QStash deliveries must forward Authorization via
 * `Upstash-Forward-Authorization`.
 */
export function verifyQStashJob(request: Request): boolean {
  const jobSecret = process.env.INTEGRATION_AUTH_SECRET?.trim();
  if (!jobSecret || /fitconnect-dev/i.test(jobSecret)) return false;
  return request.headers.get("authorization") === `Bearer ${jobSecret}`;
}
