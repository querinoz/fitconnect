import { NextResponse } from "next/server";
import type { ContextUser } from "@fitconnect/api-client";
import type { AppCapability } from "@fitconnect/types";
import { isDemoMode } from "@/lib/auth/supabase/client";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";
import { verifyFirebaseIdToken } from "@/lib/auth/firebase-verify";
import { readAccessToken } from "@/lib/auth/read-access-token";
import { lookupIdentityRole } from "@/lib/identity/repository";
import {
  listCapabilities,
  readPreferredActiveMode,
  resolveActiveMode
} from "@/lib/identity/entitlements";

export type AuthSuccess = {
  ok: true;
  user: ContextUser;
  supabaseUserId: string;
  accessToken: string | null;
  demo: boolean;
  capabilities: AppCapability[];
  activeMode: "athlete" | "coach" | null;
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
      demo: true,
      capabilities: ["athlete", "coach"],
      activeMode: "athlete"
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

  const capabilities = await listCapabilities(claims.sub, accessToken);
  const preferred = await readPreferredActiveMode(claims.sub, accessToken);
  const legacy = (await lookupIdentityRole(claims.sub, accessToken)) ?? null;

  // ADMIN is server-assigned only — never derived from client activeMode.
  if (legacy === "admin") {
    return {
      ok: true,
      user: {
        id: claims.sub,
        role: "admin",
        email: claims.email
      },
      supabaseUserId: claims.sub,
      accessToken,
      demo: false,
      capabilities: ["athlete", "coach"],
      activeMode: preferred === "coach" ? "coach" : "athlete"
    };
  }

  const effectiveCaps: AppCapability[] = capabilities.length
    ? capabilities
    : legacy === "coach" || legacy === "athlete"
      ? [legacy]
      : ["athlete"];
  const activeMode = resolveActiveMode({
    capabilities: effectiveCaps,
    preferred,
    legacyRole: legacy
  });
  const role = (activeMode ?? legacy ?? "athlete") as ContextUser["role"];

  return {
    ok: true,
    user: {
      id: claims.sub,
      role,
      email: claims.email
    },
    supabaseUserId: claims.sub,
    accessToken,
    demo: false,
    capabilities: effectiveCaps,
    activeMode
  };
}

export async function requireAthleteCapability(
  request: Request
): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;
  if (auth.demo) return auth;
  if (auth.user.role === "admin") return auth;
  if (!auth.capabilities.includes("athlete")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "forbidden", reason: "athlete_capability_required" },
        { status: 403 }
      )
    };
  }
  return auth;
}

export async function requireCoachCapability(
  request: Request
): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth;
  if (auth.demo) return auth;
  if (auth.user.role === "admin") return auth;
  if (!auth.capabilities.includes("coach")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "forbidden", reason: "coach_capability_required" },
        { status: 403 }
      )
    };
  }
  return auth;
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

  if (!auth.capabilities.includes("athlete") && auth.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "forbidden", reason: "athlete_capability_required" },
        { status: 403 }
      )
    };
  }

  if (fromParam && fromParam !== auth.user.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  return { athleteId: auth.user.id, accessToken: auth.accessToken };
}

/** Resolve coach id — demo permissive; prod requires coach capability. */
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

  const hasCoach =
    auth.capabilities.includes("coach") ||
    auth.user.role === "coach" ||
    auth.user.role === "admin";
  if (!hasCoach) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "forbidden", reason: "coach_capability_required" },
        { status: 403 }
      )
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

/**
 * Coach may only access athletes on their roster (anti-IDOR).
 */
export async function requireCoachOwnsAthlete(
  request: Request,
  athleteId: string
): Promise<
  | { coachId: string; athleteId: string; accessToken: string | null }
  | AuthFailure
> {
  const resolved = await requireCoachId(request);
  if (isAuthFailure(resolved)) return resolved;

  if (!athleteId.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "athleteId_required" }, { status: 400 })
    };
  }

  const { coachOwnsAthlete } = await import("@/lib/db/repository");
  const owned = await coachOwnsAthlete(resolved.coachId, athleteId);
  if (!owned) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 })
    };
  }

  return {
    coachId: resolved.coachId,
    athleteId,
    accessToken: resolved.accessToken
  };
}

export function isAuthFailure(
  result: { athleteId: string } | { coachId: string } | AuthFailure
): result is AuthFailure {
  return "ok" in result && result.ok === false;
}
