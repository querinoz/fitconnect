import { cookies } from "next/headers";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}

/** Resolve athlete id for integration routes — demo mode is permissive; prod binds to cookie/header. */
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
    authSecret && authHeader === `Bearer ${authSecret}` && Boolean(headerId);

  if (bearerOk && headerId) {
    return { athleteId: headerId };
  }

  const cookieStore = await cookies();
  const cookieAthlete = cookieStore.get("fc-athlete-id")?.value;
  const resolved = fromParam ?? headerId ?? cookieAthlete;

  if (!resolved) {
    return { error: "unauthorized", status: 401 };
  }

  if (cookieAthlete && resolved !== cookieAthlete) {
    return { error: "athlete_mismatch", status: 403 };
  }

  return { athleteId: resolved };
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

  const cookieStore = await cookies();
  const cookieCoach = cookieStore.get("fc-coach-id")?.value;
  const resolved = fromParam ?? cookieCoach;

  if (!resolved) {
    return { error: "unauthorized", status: 401 };
  }

  return { coachId: resolved };
}

export function verifyQStashJob(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const token = process.env.QSTASH_TOKEN;
  if (!token) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${token}`) return true;
  return Boolean(request.headers.get("upstash-signature"));
}
