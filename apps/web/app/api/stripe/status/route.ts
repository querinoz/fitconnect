import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getConnectAccountPg, getSubscriptionPg } from "@/lib/stripe/persistence";
import { isStripeLive } from "@/lib/stripe/server";

/**
 * Stripe / Connect status port.
 * Fail-closed without secrets: live=false and Connect never reports
 * charges/payouts enabled unless Stripe is actually configured.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const live = isStripeLive();

  const subscription = live ? await getSubscriptionPg(auth.user.id) : null;
  const connectRow =
    live && (auth.user.role === "coach" || auth.demo)
      ? await getConnectAccountPg(auth.user.id)
      : null;

  return NextResponse.json({
    live,
    configured: live,
    subscription: subscription
      ? {
          planId: subscription.plan_id,
          status: subscription.status,
          gracePeriodEndsAt: subscription.grace_period_ends_at
        }
      : null,
    connect: connectRow
      ? {
          chargesEnabled: Boolean(connectRow.charges_enabled),
          payoutsEnabled: Boolean(connectRow.payouts_enabled),
          onboardingComplete: Boolean(connectRow.onboarding_complete)
        }
      : null
  });
}
