import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getOnboardingState, upsertOnboardingState } from "@/lib/identity/repository";
import { parseAppRole } from "@/lib/identity/role-policy";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      role: auth.user.role,
      step: 0,
      completed: true,
      payload: {}
    });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await getOnboardingState(auth.user.id, auth.accessToken);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.state);
}

export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as {
    role?: string;
    step?: number;
    completed?: boolean;
    payload?: Record<string, unknown>;
  };
  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      role: parseAppRole(body.role) ?? auth.user.role,
      step: body.step ?? 0,
      completed: body.completed ?? false,
      payload: body.payload ?? {}
    });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await upsertOnboardingState(auth.user.id, auth.accessToken, {
    role: parseAppRole(body.role),
    step: body.step,
    completed: body.completed,
    payload: body.payload
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.state);
}
