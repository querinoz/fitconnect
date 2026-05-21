import { NextResponse } from "next/server";
import { isStripeLive, verifyStripeWebhook } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (isStripeLive()) {
    try {
      const event = await verifyStripeWebhook(request);
      return NextResponse.json({
        received: true,
        demo: false,
        eventType: event.type,
        eventId: event.id
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook verification failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

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
