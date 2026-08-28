import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { persistenceReady, isMemoryPersistence } from "@/lib/persistence/config";
import {
  contributeToSquadChallenge,
  getSquadChallenge,
  joinSquadChallenge
} from "@/lib/squads/server-challenges";
import {
  contributeSquadChallengeInSupabase,
  getSquadChallengeFromSupabase,
  joinSquadChallengeInSupabase
} from "@/lib/squads/supabase-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (isMemoryPersistence()) {
    const challenge = getSquadChallenge(id);
    return NextResponse.json({ challenge, source: "memory" });
  }

  const challenge = await getSquadChallengeFromSupabase(id);
  if (!challenge) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ challenge, source: "supabase" });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: "join" | "contribute";
    distanceM?: number;
    userId?: string;
  } | null;

  const userId = auth.demo ? body?.userId ?? auth.user.id : auth.user.id;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (isMemoryPersistence()) {
    if (body?.action === "contribute") {
      const challenge = contributeToSquadChallenge(id, userId, Number(body.distanceM ?? 0));
      return NextResponse.json({ challenge, source: "memory" });
    }
    const challenge = joinSquadChallenge(id, userId);
    return NextResponse.json({ challenge, source: "memory" });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "token_required" }, { status: 401 });
  }

  if (body?.action === "contribute") {
    const challenge = await contributeSquadChallengeInSupabase(
      id,
      userId,
      Number(body.distanceM ?? 0),
      auth.accessToken
    );
    if (!challenge) return NextResponse.json({ error: "contribute_failed" }, { status: 403 });
    return NextResponse.json({ challenge, source: "supabase" });
  }

  const challenge = await joinSquadChallengeInSupabase(id, userId, auth.accessToken);
  if (!challenge) return NextResponse.json({ error: "join_failed" }, { status: 403 });
  return NextResponse.json({ challenge, source: "supabase" });
}
