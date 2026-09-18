import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  coachMayAccessAthlete,
  listCoachAthletes,
  upsertCoachAthleteLink
} from "@/lib/coach/roster-acl";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.user.role !== "coach" && auth.user.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    athletes: listCoachAthletes(auth.user.id),
    note: "Cross-tenant access denied unless active link + scope."
  });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.user.role !== "coach" && auth.user.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  if (b.action === "check") {
    const athleteId = typeof b.athleteId === "string" ? b.athleteId : "";
    const scope = (b.scope as "training" | "recovery" | "performance" | "nutrition" | "notes") ?? "training";
    const access = coachMayAccessAthlete({
      coachId: auth.user.id,
      athleteId,
      scope
    });
    return NextResponse.json({ access }, { status: access.ok ? 200 : 403 });
  }

  if (b.action === "link") {
    if (b.confirm !== true) {
      return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
    }
    const athleteId = typeof b.athleteId === "string" ? b.athleteId : "";
    if (!athleteId) return NextResponse.json({ error: "athlete_required" }, { status: 422 });
    const scopes = Array.isArray(b.scopes)
      ? (b.scopes as Array<"training" | "recovery" | "performance" | "nutrition" | "notes">)
      : (["training"] as const);
    upsertCoachAthleteLink({
      coachId: auth.user.id,
      athleteId,
      scopes: [...scopes],
      active: true,
      revokedAt: null
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
