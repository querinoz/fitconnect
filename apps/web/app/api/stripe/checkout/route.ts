import { NextResponse } from "next/server";
import { createDemoCheckout, type CheckoutKind } from "@/lib/stripe/demo";
import { createLiveCheckout, isStripeLive } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    kind?: CheckoutKind;
    amountCents?: number;
    athleteEmail?: string;
    coachId?: string;
    programId?: string;
  };

  const kind = body.kind ?? "session";
  const amountCents = body.amountCents ?? 6500;

  if (isStripeLive()) {
    try {
      const result = await createLiveCheckout(request, {
        kind,
        amountCents,
        athleteEmail: body.athleteEmail,
        coachId: body.coachId,
        programId: body.programId
      });
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe checkout failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const result = createDemoCheckout({
    kind,
    amountCents,
    athleteEmail: body.athleteEmail,
    coachId: body.coachId,
    programId: body.programId
  });

  return NextResponse.json(result);
}
