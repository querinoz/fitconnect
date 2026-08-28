import type Stripe from "stripe";
import { getPrisma } from "@/lib/db/client";
import { isProductionSecurityMode } from "@/lib/security/runtime";
import {
  claimStripeEventPg,
  isStripePgPersistenceAvailable,
  recordPaymentTransactionPg,
  updateSubscriptionByStripeIdPg,
  upsertSubscriptionPg
} from "./persistence";
import { syncConnectAccountFromStripe } from "./server";

export function isWebhookProcessingEnabled(): boolean {
  return process.env.STRIPE_WEBHOOK_PROCESSING !== "false";
}

export function isStripePersistenceAvailable(): boolean {
  if (isStripePgPersistenceAvailable()) return true;
  return getPrisma() !== null;
}

export async function claimStripeEvent(event: Stripe.Event): Promise<boolean> {
  if (isStripePgPersistenceAvailable()) {
    return claimStripeEventPg(event.id, event.type);
  }

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

function sessionUserId(session: Stripe.Checkout.Session): string {
  return session.metadata?.userId ?? session.customer_email ?? "unknown";
}

export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const kind = session.metadata?.kind ?? "session";
  const userId = sessionUserId(session);

  if (kind === "subscription") {
    if (isStripePgPersistenceAvailable()) {
      await upsertSubscriptionPg({
        userId,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
        planId: session.metadata?.planId ?? "athlete",
        status: "active",
        gracePeriodEndsAt: null
      });
      return;
    }

    const db = getPrisma();
    if (!db) return;

    await db.userSubscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
        planId: session.metadata?.planId ?? "athlete",
        status: "active"
      },
      update: {
        stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
        planId: session.metadata?.planId ?? "athlete",
        status: "active",
        gracePeriodEndsAt: null
      }
    });
    return;
  }

  if (!isStripePgPersistenceAvailable()) return;

  const amountCents = session.amount_total ?? 0;
  const coachShareCents = Number(session.metadata?.coachShareCents ?? 0);
  const platformFeeCents = Number(session.metadata?.platformFeeCents ?? 0);

  await recordPaymentTransactionPg({
    checkoutSessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    athleteId: userId,
    coachId: session.metadata?.coachId || undefined,
    programId: session.metadata?.programId || undefined,
    kind,
    amountCents,
    platformFeeCents,
    coachPayoutCents: coachShareCents,
    status: "succeeded"
  });
}

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const planId =
    subscription.metadata?.planId ??
    subscription.items.data[0]?.price?.id ??
    "athlete";

  if (isStripePgPersistenceAvailable()) {
    await updateSubscriptionByStripeIdPg(subscription.id, {
      status: subscription.status,
      planId
    });
    return;
  }

  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: subscription.status, planId }
  });
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  if (isStripePgPersistenceAvailable()) {
    await updateSubscriptionByStripeIdPg(subscription.id, { status: "cancelled" });
    return;
  }

  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "cancelled" }
  });
}

export async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | null }).subscription ===
    "string"
      ? (invoice as Stripe.Invoice & { subscription?: string }).subscription
      : undefined;
  if (!subscriptionId) return;

  const grace = new Date();
  grace.setDate(grace.getDate() + 3);

  if (isStripePgPersistenceAvailable()) {
    await updateSubscriptionByStripeIdPg(subscriptionId, {
      status: "past_due",
      gracePeriodEndsAt: grace
    });
    return;
  }

  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "past_due", gracePeriodEndsAt: grace }
  });
}

export async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId =
    typeof (invoice as Stripe.Invoice & { subscription?: string | null }).subscription ===
    "string"
      ? (invoice as Stripe.Invoice & { subscription?: string }).subscription
      : undefined;
  if (!subscriptionId) return;

  if (isStripePgPersistenceAvailable()) {
    await updateSubscriptionByStripeIdPg(subscriptionId, {
      status: "active",
      gracePeriodEndsAt: null
    });
    return;
  }

  const db = getPrisma();
  if (!db) return;

  await db.userSubscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: "active", gracePeriodEndsAt: null }
  });
}

export async function handleAccountUpdated(event: Stripe.Event) {
  const account = event.data.object as Stripe.Account;
  await syncConnectAccountFromStripe(account.id);
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
    case "account.updated":
      await handleAccountUpdated(event);
      break;
    default:
      break;
  }
}

export async function processStripeWebhookEvent(event: Stripe.Event) {
  if (!isWebhookProcessingEnabled()) {
    return { received: true, processed: false, demo: false, eventType: event.type, eventId: event.id };
  }

  if (isProductionSecurityMode() && !isStripePersistenceAvailable()) {
    return {
      received: true,
      processed: false,
      degraded: true,
      reason: "persistence_unavailable" as const,
      eventType: event.type,
      eventId: event.id
    };
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
