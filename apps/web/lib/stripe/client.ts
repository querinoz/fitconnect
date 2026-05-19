export type CheckoutKind = "session" | "program" | "subscription";

export async function startStripeCheckout(input: {
  kind: CheckoutKind;
  amountCents: number;
  athleteEmail?: string;
  coachId?: string;
  programId?: string;
}) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error("Checkout failed");
  return res.json() as Promise<{
    id: string;
    status: string;
    coachShareCents: number;
    platformFeeCents: number;
  }>;
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
  return res.json() as Promise<{ onboardingUrl: string }>;
}
