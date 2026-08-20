import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

type Body = { email?: string; source?: string };

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "leads");
  if (limited) return limited;

  const body = (await request.json().catch(() => ({}))) as Body;
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  console.info("[lead]", { email, source: body.source ?? "unknown", at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
