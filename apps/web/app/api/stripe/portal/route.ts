import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { createBillingPortalSession, isStripeLive } from "@/lib/stripe/server";
import { getCustomerIdPg } from "@/lib/stripe/persistence";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  if (!isStripeLive()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const customerId = await getCustomerIdPg(auth.user.id);
  if (!customerId) {
    return NextResponse.json({ error: "no_billing_customer" }, { status: 404 });
  }

  try {
    const portal = await createBillingPortalSession(request, { customerId });
    return NextResponse.json(portal);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Billing portal failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
