import { NextResponse } from "next/server";
import { isRealtimeMessage } from "@/lib/realtime/types";
import { resolveTransport } from "@/lib/platform/realtime/resolve-transport";

/** In-memory fallback store when Convex is unavailable (mobile bridge). */
const memoryStore = new Map<string, { payload: unknown; at: number }[]>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const since = Number(searchParams.get("since") ?? "0");
  if (!channel) {
    return NextResponse.json({ error: "channel required" }, { status: 400 });
  }
  const rows = (memoryStore.get(channel) ?? []).filter((r) => r.at > since);
  return NextResponse.json({ messages: rows });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    channel?: string;
    payload?: unknown;
  } | null;
  if (!body?.channel || !isRealtimeMessage(body.payload)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const channel = body.channel;
  const payload = body.payload;
  const at = Date.now();

  const list = memoryStore.get(channel) ?? [];
  list.push({ payload, at });
  memoryStore.set(channel, list.slice(-200));

  resolveTransport(channel).publish(channel, payload);

  return NextResponse.json({ ok: true, at });
}
