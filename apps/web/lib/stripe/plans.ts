export type SubscriptionPlan = "athlete" | "team" | "coach";

export type BillingPeriod = "monthly" | "annual";

export const PLAN_PRICES_EUR: Record<SubscriptionPlan, Record<BillingPeriod, number>> = {
  athlete: { monthly: 12, annual: 9 },
  team: { monthly: 29, annual: 24 },
  coach: { monthly: 29, annual: 24 }
};

export function planAmountCents(plan: SubscriptionPlan, period: BillingPeriod): number {
  return PLAN_PRICES_EUR[plan][period] * 100;
}

export function planDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case "athlete":
      return "FitConnect Athlete Plus";
    case "team":
      return "FitConnect Team";
    case "coach":
      return "FitConnect Coach Pro";
    default:
      return "FitConnect";
  }
}

export function stripePriceEnvKey(plan: SubscriptionPlan, period: BillingPeriod): string {
  return `STRIPE_PRICE_${plan.toUpperCase()}_${period.toUpperCase()}`;
}

export function resolveStripePriceId(plan: SubscriptionPlan, period: BillingPeriod): string | null {
  const key = stripePriceEnvKey(plan, period);
  const value = process.env[key]?.trim();
  return value && !value.includes("PASTE") ? value : null;
}
