import { COACH_TAKE_HOME_RATE, PLATFORM_SUBSCRIPTION_EUR } from "./constants";

export type CheckoutKind = "session" | "program" | "subscription";

/** Honest demo checkout — never claims paid success without Stripe secrets. */
export const DEMO_CHECKOUT_STATUS = "demo_preview" as const;
export const DEMO_SUBSCRIPTION_STATUS = "demo_preview" as const;

export type DemoCheckoutInput = {
  kind: CheckoutKind;
  amountCents: number;
  athleteEmail?: string;
  coachId?: string;
  programId?: string;
};

export type DemoCheckoutResult = {
  id: string;
  status: typeof DEMO_CHECKOUT_STATUS;
  clientSecret: string;
  coachShareCents: number;
  platformFeeCents: number;
  url: string;
  demo: true;
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
    status: DEMO_CHECKOUT_STATUS,
    clientSecret: `${id}_secret_demo`,
    coachShareCents,
    platformFeeCents,
    url: `https://checkout.stripe.com/demo/${id}`,
    demo: true
  };
}

export function createDemoSubscription(email: string) {
  return {
    id: `sub_demo_${Date.now()}`,
    status: DEMO_SUBSCRIPTION_STATUS,
    amountCents: PLATFORM_SUBSCRIPTION_EUR * 100,
    email,
    interval: "month" as const,
    demo: true as const
  };
}

/**
 * Demo Connect account — onboarding URL only.
 * Never reports charges/payouts enabled (no fake paid / ready success).
 */
export function createDemoConnectAccount(coachId: string) {
  return {
    id: `acct_demo_${coachId}`,
    onboardingUrl: `https://connect.stripe.com/demo/onboard/${coachId}`,
    chargesEnabled: false,
    payoutsEnabled: false,
    onboardingComplete: false,
    demo: true as const
  };
}
