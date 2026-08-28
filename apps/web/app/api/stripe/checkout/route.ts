import { NextResponse } from "next/server";
import { requireAuth, isAuthFailure } from "@/lib/api/require-auth";
import { createDemoCheckout, type CheckoutKind } from "@/lib/stripe/demo";
import { createLiveCheckout, isStripeLive } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthFailure(auth)) return auth.response;

  const body = (await request.json()) as {
    kind?: CheckoutKind;
    amountCents?: number;
    athleteEmail?: string;
    coachId?: string;
    programId?: string;
  };

  const kind = body.kind ?? "session";
  const amountCents = body.amountCents ?? 6500;
  const athleteEmail = body.athleteEmail ?? auth.user.email ?? undefined;

  if (isStripeLive()) {
    try {
      const result = await createLiveCheckout(request, {
        kind,
        amountCents,
        userId: auth.user.id,
        athleteEmail,
        coachId: body.coachId,
        programId: body.programId
      });
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe checkout failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (!auth.demo) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const result = createDemoCheckout({
    kind,
    amountCents,
    athleteEmail,
    coachId: body.coachId,
    programId: body.programId
  });

  return NextResponse.json(result);
}
