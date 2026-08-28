import { NextResponse } from "next/server";
import Stripe from "stripe";
import { isStripeLive, verifyStripeWebhook } from "@/lib/stripe/server";
import { processStripeWebhookEvent } from "@/lib/stripe/webhook-handler";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isProductionSecurityMode } from "@/lib/security/runtime";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "webhook");
  if (limited) return limited;

  if (isProductionSecurityMode() && !isStripeLive()) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  if (isStripeLive()) {
    try {
      const event = await verifyStripeWebhook(request);
      const result = await processStripeWebhookEvent(event);
      // 503 tells Stripe to retry rather than marking the event delivered.
      if ("degraded" in result && result.degraded) {
        return NextResponse.json(result, { status: 503 });
      }
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook verification failed";
      const status = /not configured/i.test(message) ? 503 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  }

  if (isProductionSecurityMode()) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  let eventType = "checkout.session.completed";
  const signature = request.headers.get("stripe-signature");

  try {
    const rawBody = await request.text();
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
