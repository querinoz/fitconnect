import { COACH_TAKE_HOME_RATE, PLATFORM_SUBSCRIPTION_EUR } from "./constants";

export type CheckoutKind = "session" | "program" | "subscription";

export type DemoCheckoutInput = {
  kind: CheckoutKind;
  amountCents: number;
  athleteEmail?: string;
  coachId?: string;
  programId?: string;
};

export type DemoCheckoutResult = {
  id: string;
  status: "succeeded";
  clientSecret: string;
  coachShareCents: number;
  platformFeeCents: number;
  url: string;
};

export function createDemoCheckout(input: DemoCheckoutInput): DemoCheckoutResult {
  const id = `pi_demo_${Date.now()}`;
  const coachShareCents =
    input.kind === "subscription"
      ? 0
      : Math.round(input.amountCents * COACH_TAKE_HOME_RATE);
  const platformFeeCents = input.amountCents - coachShareCents;

  return {
    id,
    status: "succeeded",
    clientSecret: `${id}_secret_demo`,
    coachShareCents,
    platformFeeCents,
    url: `https://checkout.stripe.com/demo/${id}`
  };
}

export function createDemoSubscription(email: string) {
  return {
    id: `sub_demo_${Date.now()}`,
    status: "active" as const,
    amountCents: PLATFORM_SUBSCRIPTION_EUR * 100,
    email,
    interval: "month" as const
  };
}

export function createDemoConnectAccount(coachId: string) {
  return {
    id: `acct_demo_${coachId}`,
    onboardingUrl: `https://connect.stripe.com/demo/onboard/${coachId}`,
    chargesEnabled: true,
    payoutsEnabled: true
  };
}
