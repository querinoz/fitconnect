import { NextResponse } from "next/server";

type Body = { email?: string; source?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // Production: forward to CRM / PostHog / Convex — stub persists in logs for now
  console.info("[lead]", { email, source: body.source ?? "unknown", at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
