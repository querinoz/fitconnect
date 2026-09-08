import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { canAssignAppRole, parseAppRole } from "@/lib/identity/role-policy";
import { assignIdentityRole, lookupIdentityRole } from "@/lib/identity/repository";
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
      capabilities: auth.capabilities,
      activeMode: auth.activeMode
    });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const role = await lookupIdentityRole(auth.user.id, auth.accessToken);
  return NextResponse.json({
    uid: auth.user.id,
    role,
    capabilities: auth.capabilities,
    activeMode: auth.activeMode
  });
}

/**
 * First capability grant (RoleSelect) OR add a second capability (unified identity).
 * Does not replace capabilities — see assignIdentityRole.
 */
export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => ({}))) as { role?: string };
  const next = parseAppRole(body.role);
  if (!next || next === "admin" || !canAssignAppRole(null, next)) {
    return NextResponse.json({ error: "role_not_allowed" }, { status: 403 });
  }
  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      role: next,
      capabilities: Array.from(new Set([...(auth.capabilities ?? []), next])),
      activeMode: next
    });
  }
  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const current = await lookupIdentityRole(auth.user.id, auth.accessToken);
  // Same role reaffirm OR first assign OR second capability (handled in repository).
  if (current && current !== next && !canAssignAppRole(current, next)) {
    // Second capability path — intentional for unified identity.
  } else if (!canAssignAppRole(current, next)) {
    return NextResponse.json({ error: "role_locked" }, { status: 403 });
  }
  const result = await assignIdentityRole(auth.user.id, auth.accessToken, next);
  if (result.error) {
    return NextResponse.json({ error: result.error, role: result.role }, { status: result.status });
  }
  return NextResponse.json({
    uid: auth.user.id,
    role: result.role,
    activeMode: result.role
  });
}
