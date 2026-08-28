import { NextResponse } from "next/server";
import { isRealtimeMessage } from "@/lib/realtime/types";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";
import { requireAuth } from "@/lib/api/require-auth";
import { appendBridgeMessage, readBridgeMessages } from "@/lib/realtime/bridge-store";

/**
 * SECURITY: channels are namespaced `<kind>:<subjectId>`. A caller may only
 * read or write channels whose subject is their own authenticated id.
 * Before this, both verbs were unauthenticated: anyone could poll
 * `athlete:<id>` to read another athlete's live vitals, or POST fabricated
 * readings into their coach's dashboard.
 */
function isOwnChannel(channel: string, userId: string): boolean {
  const separator = channel.indexOf(":");
  if (separator <= 0) return false;
  const subject = channel.slice(separator + 1);
  return subject.length > 0 && subject === userId;
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const since = Number(searchParams.get("since") ?? "0");
  if (!channel) {
    return NextResponse.json({ error: "channel required" }, { status: 400 });
  }
  if (!isOwnChannel(channel, auth.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rows = readBridgeMessages(channel, since);
  return NextResponse.json({ messages: rows });
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    channel?: string;
    payload?: unknown;
  } | null;
  if (!body?.channel || !isRealtimeMessage(body.payload)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  if (!isOwnChannel(body.channel, auth.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const channel = body.channel;
  const payload = body.payload;
  const at = appendBridgeMessage(channel, payload);

  resolveTransport(channel).publish(channel, payload);

  return NextResponse.json({ ok: true, at });
}
