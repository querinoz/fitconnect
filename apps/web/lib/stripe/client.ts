export type CheckoutKind = "session" | "program" | "subscription";

export type CheckoutResult = {
  id: string;
  status: string;
  coachShareCents: number;
  platformFeeCents: number;
  url?: string | null;
  clientSecret?: string | null;
};

/** True when the publishable key is configured (client-side hint). */
export function isStripePublishableConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
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
  if (!res.ok) throw new Error("Checkout failed");
  const result = (await res.json()) as CheckoutResult;

  if (result.url && typeof window !== "undefined") {
    window.location.assign(result.url);
  }

  return result;
}

export async function startSubscription(email: string) {
  const res = await fetch("/api/stripe/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Subscribe failed");
  return res.json();
}

export async function startConnectOnboarding(coachId: string) {
  const res = await fetch("/api/stripe/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coachId })
  });
  if (!res.ok) throw new Error("Connect failed");
  const result = (await res.json()) as { onboardingUrl: string };

  if (result.onboardingUrl && typeof window !== "undefined") {
    window.location.assign(result.onboardingUrl);
  }

  return result;
}
