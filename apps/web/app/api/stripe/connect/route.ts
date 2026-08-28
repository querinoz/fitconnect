import { NextResponse } from "next/server";
import { requireAuth, isAuthFailure } from "@/lib/api/require-auth";
import { createDemoConnectAccount } from "@/lib/stripe/demo";
import { createLiveConnectAccount, isStripeLive } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) return auth.response;

  const body = (await request.json()) as { coachId?: string };
  const coachId =
    !body.coachId || body.coachId === "self" ? auth.user.id : body.coachId;

  if (auth.user.role === "athlete" && coachId !== auth.user.id && !auth.demo) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (isStripeLive()) {
    try {
      const account = await createLiveConnectAccount(request, {
        coachId,
        email: auth.user.email ?? undefined
      });
      return NextResponse.json(account);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe Connect failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (!auth.demo) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const account = createDemoConnectAccount(coachId);
  return NextResponse.json(account);
}
