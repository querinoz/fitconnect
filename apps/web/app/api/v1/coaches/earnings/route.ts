import { NextResponse } from "next/server";
import { isAuthFailure, requireCoachId } from "@/lib/api/require-auth";
import { getCoachEarningsLedger } from "@/lib/db/coach-earnings";

/**
 * Coach earnings ledger (read). Invoice/transfer remain fail-closed without Stripe Connect.
 * Never returns fabricated revenue numbers.
 */
export async function GET(req: Request) {
  const resolved = await requireCoachId(req);
  if (isAuthFailure(resolved)) return resolved.response;
  const ledger = await getCoachEarningsLedger(resolved.coachId);
  return NextResponse.json({ earnings: ledger, source: ledger.source });
}
