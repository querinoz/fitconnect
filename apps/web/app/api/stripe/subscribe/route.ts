import { NextResponse } from "next/server";
import { createDemoSubscription } from "@/lib/stripe/demo";
import { createLiveSubscription, isStripeLive } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email ?? "athlete@fitconnect.local";

  if (isStripeLive()) {
    try {
      const sub = await createLiveSubscription(request, email);
      return NextResponse.json(sub);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe subscription failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  const sub = createDemoSubscription(email);
  return NextResponse.json(sub);
}
