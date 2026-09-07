import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  createNotification,
  listNotifications,
  markNotificationRead
} from "@/lib/db/user-notifications";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const notifications = listNotifications(auth.user.id).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    deepLink: n.deepLink,
    read: n.read,
    createdAt: n.createdAt
  }));
  return NextResponse.json({ notifications, source: "memory" });
}

/** Test/dev helper + coach→athlete fanout may POST; production push uses FCM. */
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const body = (await req.json().catch(() => null)) as {
    title?: string;
    body?: string;
    deepLink?: string | null;
    userId?: string;
  } | null;
  if (!body?.title?.trim() || !body?.body?.trim()) {
    return NextResponse.json({ error: "title_and_body_required" }, { status: 400 });
  }
  const targetUserId = body.userId?.trim() || auth.user.id;
  if (targetUserId !== auth.user.id && auth.user.role !== "coach" && auth.user.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const row = createNotification({
    userId: targetUserId,
    title: body.title,
    body: body.body,
    deepLink: body.deepLink
  });
  return NextResponse.json({ notification: row, source: "memory" }, { status: 201 });
}

export async function PUT(req: Request) {
  return PATCH(req);
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id?.trim()) {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  const updated = markNotificationRead(auth.user.id, body.id);
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ notification: updated, source: "memory" });
}
