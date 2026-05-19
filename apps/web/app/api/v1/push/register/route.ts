import { NextResponse } from "next/server";
import { registerPushToken } from "@/lib/notifications/push-store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    token?: string;
    platform?: string;
  } | null;

  if (!body?.userId || !body?.token) {
    return NextResponse.json({ error: "userId and token required" }, { status: 400 });
  }

  await registerPushToken({
    userId: body.userId,
    token: body.token,
    platform: body.platform ?? "unknown"
  });

  return NextResponse.json({ ok: true });
}
