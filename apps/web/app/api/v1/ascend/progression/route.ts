import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { persistenceReady, useMemoryPersistence } from "@/lib/persistence/config";
import {
  applyProgressionEvent,
  getProgression,
  patchProgression,
  type ProgressionEvent
} from "@/lib/progression/server-store";
import {
  applyProgressionEventInSupabase,
  getProgressionFromSupabase
} from "@/lib/progression/supabase-repository";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const userId = auth.demo ? searchParams.get("userId") ?? auth.user.id : auth.user.id;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (useMemoryPersistence()) {
    return NextResponse.json({ progression: getProgression(userId), source: "memory" });
  }

  const progression = await getProgressionFromSupabase(userId);
  return NextResponse.json({ progression, source: "supabase" });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    totalXp?: number;
    streakDays?: number;
    badges?: string[];
  } | null;

  const userId = auth.demo ? body?.userId ?? auth.user.id : auth.user.id;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (useMemoryPersistence()) {
    const progression = patchProgression(userId, {
      totalXp: body?.totalXp,
      streakDays: body?.streakDays,
      badges: body?.badges
    });
    return NextResponse.json({ progression, source: "memory" });
  }

  return NextResponse.json({ error: "patch_not_supported_in_supabase" }, { status: 501 });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as ProgressionEvent & {
    userId?: string;
  } | null;

  if (!body?.eventId || !body.type) {
    return NextResponse.json({ error: "eventId and type required" }, { status: 400 });
  }

  const userId = auth.demo ? body.userId ?? auth.user.id : auth.user.id;

  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  if (useMemoryPersistence()) {
    const result = applyProgressionEvent(userId, body);
    return NextResponse.json({ ...result, source: "memory" });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "token_required" }, { status: 401 });
  }

  const result = await applyProgressionEventInSupabase(userId, body, auth.accessToken);
  return NextResponse.json({ ...result, source: "supabase" });
}
