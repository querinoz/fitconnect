import { NextResponse } from "next/server";

/** Demo webhook — accepts Stripe CLI payloads in test mode. */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  let eventType = "checkout.session.completed";

  try {
    const body = (await request.json()) as { type?: string };
    if (body.type) eventType = body.type;
  } catch {
    /* empty body ok for smoke tests */
  }

  return NextResponse.json({
    received: true,
    demo: true,
    signaturePresent: Boolean(signature),
    eventType
  });
}
