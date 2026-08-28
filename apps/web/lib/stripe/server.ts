import Stripe from "stripe";
import { COACH_TAKE_HOME_RATE } from "./constants";
import type { CheckoutKind } from "./demo";
import { getConnectAccountPg, upsertConnectAccountPg } from "./persistence";
import {
  planAmountCents,
  planDisplayName,
  resolveStripePriceId,
  type BillingPeriod,
  type SubscriptionPlan
} from "./plans";
import { isProductionSecurityMode } from "@/lib/security/runtime";

let stripeInstance: Stripe | null = null;

export function isStripeLive(): boolean {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return Boolean(key && !key.includes("PASTE"));
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
    userId: string;
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

  const connect =
    input.coachId && input.kind !== "subscription"
      ? await getConnectAccountPg(input.coachId)
      : null;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
                  : "FitConnect purchase"
          }
        },
        quantity: 1
      }
    ],
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?checkout=cancel`,
    metadata: {
      kind: input.kind,
      userId: input.userId,
      coachId: input.coachId ?? "",
      programId: input.programId ?? "",
      coachShareCents: String(coachShareCents),
      platformFeeCents: String(platformFeeCents)
    }
  };

  if (connect?.stripe_account_id && connect.charges_enabled) {
    sessionParams.payment_intent_data = {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: connect.stripe_account_id }
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    id: session.id,
    status: session.status ?? "open",
    clientSecret: session.client_secret,
    coachShareCents,
    platformFeeCents,
    url: session.url
  };
}

export async function createLiveSubscription(
  request: Request,
  input: {
    userId: string;
    email: string;
    plan?: SubscriptionPlan;
    period?: BillingPeriod;
  }
) {
  const stripe = getStripe();
  const origin = appOrigin(request);
  const plan = input.plan ?? "athlete";
  const period = input.period ?? "monthly";
  const priceId = resolveStripePriceId(plan, period);
  const amountCents = planAmountCents(plan, period);

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            recurring: { interval: period === "annual" ? ("year" as const) : ("month" as const) },
            product_data: { name: planDisplayName(plan) }
          },
          quantity: 1
        }
      ];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email,
    line_items: lineItems,
    success_url: `${origin}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?subscription=cancel`,
    metadata: {
      kind: "subscription",
      userId: input.userId,
      planId: plan,
      billingPeriod: period
    },
    subscription_data: {
      metadata: {
        userId: input.userId,
        planId: plan
      }
    }
  });

  return {
    id: session.id,
    status: session.status ?? "open",
    amountCents,
    email: input.email,
    plan,
    period,
    interval: period === "annual" ? ("year" as const) : ("month" as const),
    url: session.url
  };
}

export async function createLiveConnectAccount(
  request: Request,
  input: { coachId: string; email?: string }
) {
  const stripe = getStripe();
  const origin = appOrigin(request);
  const existing = await getConnectAccountPg(input.coachId);

  let accountId = existing?.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "PT",
      email: input.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      metadata: { coachId: input.coachId }
    });
    accountId = account.id;
    await upsertConnectAccountPg({
      coachId: input.coachId,
      stripeAccountId: accountId
    });
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/coach/earnings?connect=refresh`,
    return_url: `${origin}/coach/earnings?connect=success`,
    type: "account_onboarding"
  });

  return {
    id: accountId,
    onboardingUrl: link.url,
    chargesEnabled: existing?.charges_enabled ?? false,
    payoutsEnabled: existing?.payouts_enabled ?? false
  };
}

export async function createBillingPortalSession(
  request: Request,
  input: { customerId: string }
) {
  const stripe = getStripe();
  const origin = appOrigin(request);
  const session = await stripe.billingPortal.sessions.create({
    customer: input.customerId,
    return_url: `${origin}/dashboard`
  });
  return { url: session.url };
}

export async function syncConnectAccountFromStripe(accountId: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  const coachId = account.metadata?.coachId;
  if (!coachId) return;
  await upsertConnectAccountPg({
    coachId,
    stripeAccountId: account.id,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    onboardingComplete: account.details_submitted ?? false
  });
}

export async function verifyStripeWebhook(request: Request) {
  const stripe = getStripe();
  const webhookSecret = isProductionSecurityMode()
    ? process.env.STRIPE_WEBHOOK_SECRET?.trim()
    : process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
      process.env.STRIPE_DEMO_WEBHOOK_SECRET?.trim();

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
