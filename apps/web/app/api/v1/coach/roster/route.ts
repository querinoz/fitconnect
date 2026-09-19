import { NextResponse } from "next/server";
import { requireAuth, requireCoachCapability } from "@/lib/api/require-auth";
import {
  coachMayAccessAthlete,
  listCoachAthletes,
  upsertCoachAthleteLink,
  revokeCoachAthleteLink
} from "@/lib/coach/roster-acl";

export async function GET(request: Request) {
  const auth = await requireCoachCapability(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    athletes: listCoachAthletes(auth.user.id),
    note: "Cross-tenant access denied unless active link + athlete consent + scope."
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  if (b.action === "check") {
    const coachGate = await requireCoachCapability(request);
    if (!coachGate.ok) return coachGate.response;
    const athleteId = typeof b.athleteId === "string" ? b.athleteId : "";
    const scope =
      (b.scope as "training" | "recovery" | "performance" | "nutrition" | "notes") ?? "training";
    const access = coachMayAccessAthlete({
      coachId: coachGate.user.id,
      athleteId,
      scope
    });
    return NextResponse.json({ access }, { status: access.ok ? 200 : 403 });
  }

  /**
   * Athlete consents to a coach link — coach cannot unilaterally grant access.
   * Body: { action: "consent", coachId, scopes?, confirm: true }
   */
  if (b.action === "consent") {
    if (b.confirm !== true) {
      return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
    }
    const coachId = typeof b.coachId === "string" ? b.coachId : "";
    if (!coachId) return NextResponse.json({ error: "coach_required" }, { status: 422 });
    const scopes = Array.isArray(b.scopes)
      ? (b.scopes as Array<"training" | "recovery" | "performance" | "nutrition" | "notes">)
      : (["training"] as const);
    upsertCoachAthleteLink({
      coachId,
      athleteId: auth.user.id,
      scopes: [...scopes],
      active: true,
      revokedAt: null,
      athleteConsentAt: new Date().toISOString()
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  /** Athlete or coach revokes the link */
  if (b.action === "revoke") {
    if (b.confirm !== true) {
      return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
    }
    const otherId = typeof b.otherId === "string" ? b.otherId : "";
    if (!otherId) return NextResponse.json({ error: "other_required" }, { status: 422 });
    // Athlete revokes coach → otherId is coachId; coach revokes athlete → otherId is athleteId
    if (auth.user.role === "coach" || auth.user.role === "admin") {
      revokeCoachAthleteLink(auth.user.id, otherId);
    } else {
      revokeCoachAthleteLink(otherId, auth.user.id);
    }
    return NextResponse.json({ ok: true });
  }

  // Unilateral coach "link" removed — use athlete consent
  if (b.action === "link") {
    return NextResponse.json(
      {
        error: "athlete_consent_required",
        message: "Coach cannot unilaterally link. Athlete must POST action=consent."
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
