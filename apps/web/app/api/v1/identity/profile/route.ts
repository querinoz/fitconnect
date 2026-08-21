import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  bootstrapIdentityProfile,
  getIdentityProfile,
  updateIdentityProfile
} from "@/lib/identity/repository";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      email: auth.user.email,
      displayName: "Demo",
      avatarUrl: null,
      locale: null,
      timezone: null,
      accent: null,
      role: auth.user.role,
      onboardingCompleted: true,
      onboardingStep: 0
    });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await getIdentityProfile(auth.user.id, auth.accessToken);
  if (!result.profile) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.profile);
}

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({ ok: true, uid: auth.user.id, role: auth.user.role });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    locale?: string;
    timezone?: string;
    accent?: string;
  };
  const result = await bootstrapIdentityProfile({
    uid: auth.user.id,
    accessToken: auth.accessToken,
    email: body.email ?? auth.user.email,
    displayName: body.displayName ?? null,
    avatarUrl: body.avatarUrl ?? null,
    locale: body.locale ?? null,
    timezone: body.timezone ?? null,
    accent: body.accent ?? null
  });
  if (!result.profile) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.profile);
}

export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({ ok: true, uid: auth.user.id });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    displayName?: string | null;
    avatarUrl?: string | null;
    locale?: string | null;
    timezone?: string | null;
    accent?: string | null;
  };
  const result = await updateIdentityProfile(auth.user.id, auth.accessToken, body);
  if (!result.profile) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.profile);
}
