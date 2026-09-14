import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  isAllowedAnalyticsEvent,
  recordAnalyticsEvent
} from "@/lib/observability/first-party";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "leads");
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    path?: string;
    props?: Record<string, unknown>;
  } | null;

  if (!body?.name || !isAllowedAnalyticsEvent(body.name)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  let uid: string | null = null;
  const auth = await requireAuth(request);
  if (auth.ok && !auth.demo) uid = auth.user.id;

  const recorded = await recordAnalyticsEvent({
    name: body.name,
    path: typeof body.path === "string" ? body.path.slice(0, 200) : undefined,
    uid,
    props: body.props && typeof body.props === "object" ? body.props : undefined
  });

  return NextResponse.json({ ok: true, recorded });
}
