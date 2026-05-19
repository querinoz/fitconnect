import { NextResponse } from "next/server";
import { createDemoConnectAccount } from "@/lib/stripe/demo";

export async function POST(request: Request) {
  const body = (await request.json()) as { coachId?: string };
  const coachId = body.coachId ?? "t-new";
  const account = createDemoConnectAccount(coachId);
  return NextResponse.json(account);
}
