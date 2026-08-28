import { NextResponse } from "next/server";
import type { ContextUser } from "@fitconnect/api-client";
import { isDemoMode } from "@/lib/auth/supabase/client";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { verifyFirebaseIdToken } from "@/lib/auth/firebase-verify";
import { readAccessToken } from "@/lib/auth/read-access-token";
import { lookupIdentityRole } from "@/lib/identity/repository";

export type AuthSuccess = {
  ok: true;
  user: ContextUser;
  supabaseUserId: string;
  accessToken: string | null;
  demo: boolean;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthResult = AuthSuccess | AuthFailure;

/** Require a Firebase session unless demo mode is explicitly on. */
export async function requireAuth(request?: Request): Promise<AuthResult> {
  if (isDemoMode()) {
    return {
      ok: true,
      user: { id: "demo-user", role: "athlete", email: "demo@fitconnect.app" },
      supabaseUserId: "demo-user",
      accessToken: null,
      demo: true
    };
  }

  if (!isFirebaseWebConfigured()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
    };
  }

  const accessToken = await readAccessToken(request);
  const claims = await verifyFirebaseIdToken(accessToken);
  if (!accessToken || !claims) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 })
    };
  }

  const role = (await lookupIdentityRole(claims.sub, accessToken)) ?? "athlete";
  return {
    ok: true,
    user: {
      id: claims.sub,
      role,
      email: claims.email
    },
    supabaseUserId: claims.sub,
    accessToken,
    demo: false
  };
}

/** Resolve athlete id — demo permissive; prod binds to authenticated subject (anti-IDOR). */
export async function requireAthleteId(
  request: Request,
  paramId?: string | null
): Promise<{ athleteId: string; accessToken: string | null } | AuthFailure> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("athleteId");
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;

  if (auth.demo) {
    return { athleteId: fromParam ?? "a-ines", accessToken: null };
  }

  if (auth.user.role === "admin" && fromParam) {
    return { athleteId: fromParam, accessToken: auth.accessToken };
  }

  if (fromParam && fromParam !== auth.user.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  return { athleteId: auth.user.id, accessToken: auth.accessToken };
}

/** Resolve coach id — demo permissive; prod requires auth. */
export async function requireCoachId(
  request: Request,
  paramId?: string | null
): Promise<{ coachId: string; accessToken: string | null } | AuthFailure> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("coachId");
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;

  if (auth.demo) {
    return { coachId: fromParam ?? "t-002", accessToken: null };
  }

  if (auth.user.role !== "coach" && auth.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  if (auth.user.role === "admin" && fromParam) {
    return { coachId: fromParam, accessToken: auth.accessToken };
  }

  if (fromParam && fromParam !== auth.user.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  return { coachId: auth.user.id, accessToken: auth.accessToken };
}

export function isAuthFailure(
  result: { athleteId: string } | { coachId: string } | AuthFailure
): result is AuthFailure {
  return "ok" in result && result.ok === false;
}
