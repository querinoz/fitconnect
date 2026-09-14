import type { BillingPeriod, SubscriptionPlan } from "./plans";

export type CheckoutKind = "session" | "program" | "subscription";

export type CheckoutResult = {
  id: string;
  status: string;
  coachShareCents: number;
  platformFeeCents: number;
  url?: string | null;
  clientSecret?: string | null;
};

export type SubscriptionResult = {
  id: string;
  status: string;
  amountCents: number;
  email: string;
  plan?: SubscriptionPlan;
  period?: BillingPeriod;
  url?: string | null;
};

/** True when the publishable key is configured (client-side hint). */
export function isStripePublishableConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
}

function redirectToCheckout(url: string | null | undefined) {
  if (url && typeof window !== "undefined") {
    window.location.assign(url);
  }
}

async function parseStripeError(res: Response, fallback: string): Promise<Error> {
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (body.error === "stripe_not_configured") {
    return new Error("stripe_not_configured");
  }
  if (body.error === "unauthorized") {
    return new Error("unauthorized");
  }
  return new Error(typeof body.error === "string" ? body.error : fallback);
}

export async function startStripeCheckout(input: {
  kind: CheckoutKind;
  amountCents: number;
  athleteEmail?: string;
  coachId?: string;
  programId?: string;
}): Promise<CheckoutResult> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw await parseStripeError(res, "Checkout failed");
  const result = (await res.json()) as CheckoutResult;
  redirectToCheckout(result.url);
  return result;
}

export async function startSubscription(input: {
  email?: string;
  plan?: SubscriptionPlan;
  period?: BillingPeriod;
}): Promise<SubscriptionResult> {
  const res = await fetch("/api/stripe/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw await parseStripeError(res, "Subscribe failed");
  const result = (await res.json()) as SubscriptionResult;
  redirectToCheckout(result.url);
  return result;
}

export async function startConnectOnboarding(coachId: string) {
  const res = await fetch("/api/stripe/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coachId })
  });
  if (!res.ok) throw new Error("Connect failed");
  const result = (await res.json()) as { onboardingUrl: string };
  redirectToCheckout(result.onboardingUrl);
  return result;
}

export async function openBillingPortal(): Promise<{ url: string }> {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  if (!res.ok) throw new Error("Billing portal failed");
  const result = (await res.json()) as { url: string };
  redirectToCheckout(result.url);
  return result;
}

export async function fetchStripeStatus() {
  const res = await fetch("/api/stripe/status");
  if (!res.ok) throw new Error("Stripe status failed");
  return res.json() as Promise<{
    live: boolean;
    subscription: {
      planId: string;
      status: string;
      gracePeriodEndsAt: string | null;
    } | null;
    connect: {
      chargesEnabled: boolean;
      payoutsEnabled: boolean;
      onboardingComplete: boolean;
    } | null;
  }>;
}
