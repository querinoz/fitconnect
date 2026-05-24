import type Stripe from "stripe";
import { getPrisma } from "@/lib/db/client";

export function isWebhookProcessingEnabled(): boolean {
  return process.env.STRIPE_WEBHOOK_PROCESSING !== "false";
}

export async function claimStripeEvent(event: Stripe.Event): Promise<boolean> {
  const db = getPrisma();
  if (!db) return true;

  try {
    await db.processedStripeEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const db = getPrisma();
  if (!db) return;

  const userId = session.metadata?.userId ?? session.customer_email ?? "unknown";
  await db.userSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
      planId: session.metadata?.kind === "subscription" ? "plus" : "pro",
      status: "active"
    },
    update: {
      stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
      stripeSubscriptionId:
        typeof session.subscription === "string" ? session.subscription : undefined,
      status: "active",
      gracePeriodEndsAt: null
    }
  });
}

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      planId: subscription.items.data[0]?.price?.id ?? "pro"
    }
  });
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "cancelled" }
  });
}

export async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const db = getPrisma();
  if (!db) return;

  const subscriptionId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | null }).subscription ===
    "string"
      ? (invoice as Stripe.Invoice & { subscription?: string }).subscription
      : undefined;
  if (!subscriptionId) return;

  const grace = new Date();
  grace.setDate(grace.getDate() + 3);

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "past_due", gracePeriodEndsAt: grace }
  });
}

export async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const db = getPrisma();
  if (!db) return;

  const subscriptionId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | null }).subscription ===
    "string"
      ? (invoice as Stripe.Invoice & { subscription?: string }).subscription
      : undefined;
  if (!subscriptionId) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "active", gracePeriodEndsAt: null }
  });
}

export async function dispatchStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;
    default:
      break;
  }
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  if (!isWebhookProcessingEnabled()) {
    return { received: true, processed: false, demo: false, eventType: event.type, eventId: event.id };
  }

  const claimed = await claimStripeEvent(event);
  if (!claimed) {
    return {
      received: true,
      processed: false,
      duplicate: true,
      eventType: event.type,
      eventId: event.id
    };
  }

  await dispatchStripeEvent(event);

  return {
    received: true,
    processed: true,
    eventType: event.type,
    eventId: event.id
  };
}
