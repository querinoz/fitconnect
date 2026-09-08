import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  listCapabilities,
  readPreferredActiveMode,
  resolveEntitlements,
  resolveActiveMode
} from "@/lib/identity/entitlements";
import { getIdentityProfile } from "@/lib/identity/repository";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/**
 * Aggregated identity: profile + capabilities + activeMode + plan entitlements.
 * Client must not invent capabilities from this response alone for authorization —
 * every privileged API re-checks server-side.
 */
export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      email: auth.user.email ?? null,
      displayName: "Demo",
      avatarUrl: null,
      role: auth.user.role,
      capabilities: ["athlete", "coach"],
      activeMode: auth.user.role === "coach" ? "coach" : "athlete",
      entitlements: {
        planId: "team",
        planCapabilities: ["athlete", "coach"],
        status: "active"
      },
      onboardingCompleted: true,
      onboardingStep: 0,
      demo: true
    });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profileResult = await getIdentityProfile(auth.user.id, auth.accessToken);
  if (profileResult.error && profileResult.status !== 404) {
    return NextResponse.json(
      { error: profileResult.error },
      { status: profileResult.status }
    );
  }

  const capabilities = await listCapabilities(auth.user.id, auth.accessToken);
  const preferred = await readPreferredActiveMode(auth.user.id, auth.accessToken);
  const legacy =
    profileResult.profile?.role === "coach" || profileResult.profile?.role === "athlete"
      ? profileResult.profile.role
      : null;
  const activeMode = resolveActiveMode({
    capabilities,
    preferred,
    legacyRole: legacy
  });
  const entitlements = await resolveEntitlements(auth.user.id, auth.accessToken);
  const profile = profileResult.profile;

  return NextResponse.json({
    uid: auth.user.id,
    email: profile?.email ?? auth.user.email ?? null,
    displayName: profile?.displayName ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    role: activeMode,
    capabilities,
    activeMode,
    entitlements,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    onboardingStep: profile?.onboardingStep ?? 0
  });
}
