import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { persistenceReady } from "@/lib/persistence/config";

const reports = new Map<string, { postId: string; userId: string; reason: string; at: string }>();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!persistenceReady()) {
    return NextResponse.json({ error: "persistence_not_configured" }, { status: 503 });
  }

  const { id: postId } = await params;
  const body = (await req.json().catch(() => null)) as { reason?: string } | null;
  const reason = body?.reason?.trim() || "user_report";
  const row = {
    postId,
    userId: auth.user.id,
    reason,
    at: new Date().toISOString()
  };
  reports.set(`${postId}:${auth.user.id}`, row);
  return NextResponse.json({ reported: true, report: row }, { status: 201 });
}
