import { NextResponse } from "next/server";
import { evaluateReadiness } from "@fitconnect/ai";
import { isAuthFailure, requireAthleteId } from "@/lib/api/require-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "highcost");
  if (limited) return limited;

  const body = (await req.json().catch(() => ({}))) as {
    athleteId?: string;
    hrvSeries?: number[];
    sleepHoursSeries?: number[];
    trainingLoad7d?: number;
    baselineHrv?: number;
  };

  const bound = await requireAthleteId(req, body.athleteId);
  if (isAuthFailure(bound)) return bound.response;

  const result = await evaluateReadiness({
    athleteId: bound.athleteId,
    hrvSeries: body.hrvSeries ?? [62, 64, 68],
    sleepHoursSeries: body.sleepHoursSeries ?? [7.2, 7.8, 8.1],
    trainingLoad7d: body.trainingLoad7d ?? 3200,
    baselineHrv: body.baselineHrv ?? 65
  });

  return NextResponse.json({ readiness: result });
}
