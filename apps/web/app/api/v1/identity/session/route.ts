import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseFirebaseIdToken } from "@/lib/auth/firebase-id-token";
import { FIREBASE_ID_COOKIE } from "@/lib/auth/session-cookie";
import { isDemoMode } from "@/lib/auth/supabase/client";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "auth");
  if (limited) return limited;

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }
  if (!isFirebaseWebConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as { idToken?: string } | null;
  const header = request.headers.get("authorization");
  const token = body?.idToken ?? (header?.startsWith("Bearer ") ? header.slice(7) : null);
  const claims = parseFirebaseIdToken(token);
  if (!token || !claims) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const jar = await cookies();
  const maxAge = Math.max(60, claims.exp - Math.floor(Date.now() / 1000));
  jar.set(FIREBASE_ID_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.min(maxAge, 3300)
  });
  return NextResponse.json({ ok: true, uid: claims.sub });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(FIREBASE_ID_COOKIE);
  return NextResponse.json({ ok: true });
}
