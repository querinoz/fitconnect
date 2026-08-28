import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { getConnectAccountPg, getSubscriptionPg } from "@/lib/stripe/persistence";
import { isStripeLive } from "@/lib/stripe/server";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const subscription = await getSubscriptionPg(auth.user.id);
  const connect =
    auth.user.role === "coach" || auth.demo
      ? await getConnectAccountPg(auth.user.id)
      : null;

  return NextResponse.json({
    live: isStripeLive(),
    subscription: subscription
      ? {
          planId: subscription.plan_id,
          status: subscription.status,
          gracePeriodEndsAt: subscription.grace_period_ends_at
        }
      : null,
    connect: connect
      ? {
          chargesEnabled: connect.charges_enabled,
          payoutsEnabled: connect.payouts_enabled,
          onboardingComplete: connect.onboarding_complete
        }
      : null
  });
}
