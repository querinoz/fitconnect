import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { createDemoSubscription } from "@/lib/stripe/demo";
import { createLiveSubscription, isStripeLive } from "@/lib/stripe/server";
import type { BillingPeriod, SubscriptionPlan } from "@/lib/stripe/plans";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as {
    email?: string;
    plan?: SubscriptionPlan;
    period?: BillingPeriod;
  };

  const email = body.email ?? auth.user.email ?? "athlete@fitconnect.local";
  const plan = body.plan ?? "athlete";
  const period = body.period ?? "monthly";

  if (isStripeLive()) {
    try {
      const sub = await createLiveSubscription(request, {
        userId: auth.user.id,
        email,
        plan,
        period
      });
      return NextResponse.json(sub);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe subscription failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  if (!auth.demo) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const sub = createDemoSubscription(email);
  return NextResponse.json({ ...sub, plan, period, url: null });
}
