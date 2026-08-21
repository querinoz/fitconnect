import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/client";
import { canSelectWorkoutSession } from "@/lib/fitness/workout-session-policy";

/**
 * Direct API read of workout sessions. RLS is the database barrier; this
 * route also applies the same predicate so a missing policy still fails closed.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get("userId") ?? auth.user.id;
  const prisma = getPrisma();
  if (!prisma || !isDatabaseConfigured()) {
    return NextResponse.json({ items: [], source: "LOCAL_DEMO" });
  }

  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        user_id: string;
        provider: string;
        visibility: "private" | "public" | "followers";
      }>
    >`select id, user_id, provider, visibility from workout_sessions where user_id = ${targetUserId}::text`;

    const items = rows.filter((row) =>
      canSelectWorkoutSession(auth.user.id, {
        userId: row.user_id,
        provider: row.provider,
        visibility: row.visibility
      })
    );

    return NextResponse.json({ items, source: "postgres" });
  } catch {
    return NextResponse.json({ items: [], source: "unavailable" });
  }
}
