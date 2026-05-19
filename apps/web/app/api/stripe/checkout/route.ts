import { NextResponse } from "next/server";
import {
  createDemoCheckout,
  type CheckoutKind
} from "@/lib/stripe/demo";

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

  const result = createDemoCheckout({
    kind,
    amountCents,
    athleteEmail: body.athleteEmail,
    coachId: body.coachId,
    programId: body.programId
  });

  return NextResponse.json(result);
}
