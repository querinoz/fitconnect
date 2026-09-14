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

  const hrvSeries = Array.isArray(body.hrvSeries)
    ? body.hrvSeries.filter((n) => Number.isFinite(n))
    : [];
  const sleepHoursSeries = Array.isArray(body.sleepHoursSeries)
    ? body.sleepHoursSeries.filter((n) => Number.isFinite(n))
    : [];

  if (
    hrvSeries.length === 0 ||
    sleepHoursSeries.length === 0 ||
    body.baselineHrv == null ||
    body.trainingLoad7d == null
  ) {
    return NextResponse.json(
      {
        error: "insufficient_data",
        missing: [
          hrvSeries.length === 0 ? "hrvSeries" : null,
          sleepHoursSeries.length === 0 ? "sleepHoursSeries" : null,
          body.baselineHrv == null ? "baselineHrv" : null,
          body.trainingLoad7d == null ? "trainingLoad7d" : null
        ].filter(Boolean)
      },
      { status: 422 }
    );
  }

  const result = await evaluateReadiness({
    athleteId: bound.athleteId,
    hrvSeries,
    sleepHoursSeries,
    trainingLoad7d: body.trainingLoad7d,
    baselineHrv: body.baselineHrv
  });

  return NextResponse.json({ readiness: result });
}
