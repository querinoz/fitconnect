import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/api/require-auth";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";
import { deleteOwnIdentity } from "@/lib/identity/repository";
import { purgeStravaForAthlete } from "@/lib/integrations/strava/service";
import { disconnectIntegration } from "@/lib/integrations/store";
import { enforceRateLimit } from "@/lib/security/rate-limit";

const CONFIRMATION = "DELETE";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "account-delete");
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({ error: "demo_forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== CONFIRMATION) {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const identity = await deleteOwnIdentity({ uid: auth.user.id, accessToken: auth.accessToken });
  if (!identity.ok && identity.status !== 503) {
    return NextResponse.json({ error: identity.error }, { status: identity.status });
  }

  await purgeStravaForAthlete(auth.user.id);
  disconnectIntegration(auth.user.id, "strava");

  const jar = await cookies();
  jar.delete(FIREBASE_ID_COOKIE);

  return NextResponse.json({
    ok: true,
    uid: auth.user.id,
    appData: identity.ok ? "deleted" : "identity_api_unavailable",
    strava: "purged_if_present",
    social: "no_shareable_strava_rows",
    squad: "none_persisted_in_p0",
    notifications: "not_a_p0_store",
    firebaseAuth: "PENDING_HUMAN",
    retention: {
      account_deletion_requests: "kept for audit",
      firebase_auth_user: "PENDING_HUMAN",
      billing: "not_implemented"
    }
  });
}
