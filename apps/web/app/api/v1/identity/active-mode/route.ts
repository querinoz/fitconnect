import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  canSetActiveMode,
  listCapabilities,
  parseActiveMode,
  persistActiveMode
} from "@/lib/identity/entitlements";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/**
 * Persist UX activeMode. Never grants capabilities — only switches among owned ones.
 */
export async function PUT(request: Request) {
  const limited = await enforceRateLimit(request, "identity");
  if (limited) return limited;
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { activeMode?: string; mode?: string };
  const mode = parseActiveMode(body.activeMode ?? body.mode);
  if (!mode) {
    return NextResponse.json({ error: "invalid_active_mode" }, { status: 400 });
  }

  if (auth.demo) {
    return NextResponse.json({
      uid: auth.user.id,
      activeMode: mode,
      capabilities: ["athlete", "coach"],
      demo: true
    });
  }

  if (!auth.accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const capabilities = await listCapabilities(auth.user.id, auth.accessToken);
  if (!canSetActiveMode(capabilities, mode)) {
    return NextResponse.json(
      {
        error: "forbidden",
        reason: "missing_capability",
        required: mode,
        capabilities
      },
      { status: 403 }
    );
  }

  const result = await persistActiveMode(auth.user.id, auth.accessToken, mode);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    uid: auth.user.id,
    activeMode: mode,
    capabilities,
    role: mode
  });
}
