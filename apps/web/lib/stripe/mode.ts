export type StripeCheckoutMode = "none" | "test" | "live";

/**
 * Honest Stripe posture. A present secret is not "live checkout".
 * Restricted keys (`rk_`) follow the same test/live prefix convention.
 */
export function stripeCheckoutMode(
  env: NodeJS.ProcessEnv = process.env
): StripeCheckoutMode {
  const key = env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!key || key.includes("PASTE") || key.includes("your-")) return "none";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  return "none";
}

export function isStripeConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return stripeCheckoutMode(env) !== "none";
}

export function stripeHealthDetail(mode: StripeCheckoutMode): string {
  if (mode === "live") return "live checkout";
  if (mode === "test") return "stripe test mode";
  return "not configured";
}
