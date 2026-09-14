import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { completeZenithChat } from "@/lib/ai/zenith-chat";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "highcost");
  if (limited) return limited;

  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    messages?: Array<{ role?: string; text?: string }>;
  } | null;

  const messages = (body?.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", text: m.text as string }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "messages_required" }, { status: 400 });
  }

  const result = await completeZenithChat(messages);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ text: result.text });
}
