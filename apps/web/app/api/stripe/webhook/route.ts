import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isStripeLive, verifyStripeWebhook } from "@/lib/stripe/server";
import { processStripeWebhookEvent } from "@/lib/stripe/webhook-handler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (isStripeLive()) {
    try {
      const event = await verifyStripeWebhook(request);
      const result = await processStripeWebhookEvent(event);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook verification failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  let eventType = "checkout.session.completed";
  let rawBody = "";

  try {
    rawBody = await request.text();
    const body = JSON.parse(rawBody) as { type?: string; id?: string };
    if (body.type) eventType = body.type;

    const demoEvent = {
      id: body.id ?? `evt_demo_${Date.now()}`,
      type: eventType,
      data: { object: {} }
    } as Stripe.Event;

    const result = await processStripeWebhookEvent(demoEvent);
    return NextResponse.json({
      ...result,
      demo: true,
      signaturePresent: Boolean(signature)
    });
  } catch {
    return NextResponse.json({
      received: true,
      demo: true,
      signaturePresent: Boolean(signature),
      eventType
    });
  }
}
