import { NextResponse } from "next/server";
import { evaluateReadiness } from "@fitconnect/ai";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    athleteId?: string;
    hrvSeries?: number[];
    sleepHoursSeries?: number[];
    trainingLoad7d?: number;
    baselineHrv?: number;
  };

  if (!body.athleteId) {
    return NextResponse.json({ error: "athleteId required" }, { status: 400 });
  }

  const result = await evaluateReadiness({
    athleteId: body.athleteId,
    hrvSeries: body.hrvSeries ?? [62, 64, 68],
    sleepHoursSeries: body.sleepHoursSeries ?? [7.2, 7.8, 8.1],
    trainingLoad7d: body.trainingLoad7d ?? 3200,
    baselineHrv: body.baselineHrv ?? 65
  });

  return NextResponse.json({ readiness: result });
}
