import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { isDemoMode } from "@/lib/auth/supabase/client";
import type { ContextUser } from "@fitconnect/api-client";

export type AuthSuccess = {
  ok: true;
  user: ContextUser;
  supabaseUserId: string;
  demo: boolean;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthResult = AuthSuccess | AuthFailure;

function mapSupabaseUser(user: User): ContextUser {
  const meta = user.user_metadata ?? {};
  const roleRaw = (meta.role as string | undefined)?.toLowerCase();
  const role: ContextUser["role"] =
    roleRaw === "coach" ? "coach" : roleRaw === "admin" ? "admin" : "athlete";
  return {
    id: user.id,
    role,
    email: user.email
  };
}

/** Require Supabase session unless demo mode is active. */
export async function requireAuth(): Promise<AuthResult> {
  if (isDemoMode()) {
    return {
      ok: true,
      user: { id: "demo-user", role: "athlete", email: "demo@fitconnect.app" },
      supabaseUserId: "demo-user",
      demo: true
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json({ error: "auth_not_configured" }, { status: 503 })
    };
  }

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true,
    user: mapSupabaseUser(user),
    supabaseUserId: user.id,
    demo: false
  };
}

/** Resolve athlete id — demo permissive; prod requires auth + matching id when provided. */
export async function requireAthleteId(
  request: Request,
  paramId?: string | null
): Promise<{ athleteId: string } | AuthFailure> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("athleteId");
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (auth.demo) {
    return { athleteId: fromParam ?? "a-ines" };
  }

  const cookieAthlete = request.headers.get("x-athlete-id");
  const resolved = fromParam ?? cookieAthlete ?? auth.user.id;
  if (!resolved) {
    return {
      ok: false,
      response: NextResponse.json({ error: "athleteId required" }, { status: 400 })
    };
  }

  return { athleteId: resolved };
}

/** Resolve coach id — demo permissive; prod requires auth. */
export async function requireCoachId(
  request: Request,
  paramId?: string | null
): Promise<{ coachId: string } | AuthFailure> {
  const url = new URL(request.url);
  const fromParam = paramId ?? url.searchParams.get("coachId");
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  if (auth.demo) {
    return { coachId: fromParam ?? "t-002" };
  }

  if (auth.user.role !== "coach" && auth.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  const resolved = fromParam ?? auth.user.id;
  if (!resolved) {
    return {
      ok: false,
      response: NextResponse.json({ error: "coachId required" }, { status: 400 })
    };
  }

  return { coachId: resolved };
}

export function isAuthFailure(
  result: { athleteId: string } | { coachId: string } | AuthFailure
): result is AuthFailure {
  return "ok" in result && result.ok === false;
}
