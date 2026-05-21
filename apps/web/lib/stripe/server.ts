import Stripe from "stripe";
import { COACH_TAKE_HOME_RATE, PLATFORM_SUBSCRIPTION_EUR } from "./constants";
import type { CheckoutKind } from "./demo";

let stripeInstance: Stripe | null = null;

export function isStripeLive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: "2026-04-22.dahlia"
    });
  }
  return stripeInstance;
}

function appOrigin(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3001";
}

function splitRevenue(amountCents: number, kind: CheckoutKind) {
  const coachShareCents =
    kind === "subscription" ? 0 : Math.round(amountCents * COACH_TAKE_HOME_RATE);
  return {
    coachShareCents,
    platformFeeCents: amountCents - coachShareCents
  };
}

export async function createLiveCheckout(
  request: Request,
  input: {
    kind: CheckoutKind;
    amountCents: number;
    athleteEmail?: string;
    coachId?: string;
    programId?: string;
  }
) {
  const stripe = getStripe();
  const origin = appOrigin(request);
  const { coachShareCents, platformFeeCents } = splitRevenue(
    input.amountCents,
    input.kind
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.athleteEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: input.amountCents,
          product_data: {
            name:
              input.kind === "session"
                ? "Coaching session"
                : input.kind === "program"
                  ? "Training program"
                  : "FitConnect subscription"
          }
        },
        quantity: 1
      }
    ],
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?checkout=cancel`,
    metadata: {
      kind: input.kind,
      coachId: input.coachId ?? "",
      programId: input.programId ?? "",
      coachShareCents: String(coachShareCents),
      platformFeeCents: String(platformFeeCents)
    }
  });

  return {
    id: session.id,
    status: session.status ?? "open",
    clientSecret: session.client_secret,
    coachShareCents,
    platformFeeCents,
    url: session.url
  };
}

export async function createLiveSubscription(request: Request, email: string) {
  const stripe = getStripe();
  const origin = appOrigin(request);
  const amountCents = PLATFORM_SUBSCRIPTION_EUR * 100;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: amountCents,
          recurring: { interval: "month" },
          product_data: { name: "FitConnect Athlete Plus" }
        },
        quantity: 1
      }
    ],
    success_url: `${origin}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?subscription=cancel`
  });

  return {
    id: session.id,
    status: session.status ?? "open",
    amountCents,
    email,
    interval: "month" as const,
    url: session.url
  };
}

export async function verifyStripeWebhook(request: Request) {
  const stripe = getStripe();
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_DEMO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Missing stripe-signature header");
  }

  const body = await request.text();
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  return event;
}
