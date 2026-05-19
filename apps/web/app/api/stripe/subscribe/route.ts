import { NextResponse } from "next/server";
import { createDemoSubscription } from "@/lib/stripe/demo";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email ?? "athlete@fitconnect.local";
  const sub = createDemoSubscription(email);
  return NextResponse.json(sub);
}
