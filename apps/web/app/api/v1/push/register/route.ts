import { NextResponse } from "next/server";
import { registerPushToken } from "@/lib/notifications/push-store";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "auth");
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    userId?: string;
    token?: string;
    platform?: string;
  } | null;

  if (!body?.token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  if (body.userId && body.userId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await registerPushToken({
    userId: auth.user.id,
    token: body.token,
    platform: body.platform ?? "unknown"
  });

  return NextResponse.json({ ok: true, userId: auth.user.id });
}
