import { NextResponse } from "next/server";
import { z } from "zod";
import { computeReadinessForApi } from "@/lib/readiness/compute";

const computeBodySchema = z.object({
  hrvMs: z.number(),
  baselineHrvMs: z.number().optional(),
  sleepHours: z.number().nullable().optional(),
  sleepEfficiency: z.number().optional(),
  strainScore: z.number().optional(),
  historyDays: z.union([z.literal(1), z.literal(7)]).optional()
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = computeBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const result = computeReadinessForApi({
    hrvMs: parsed.data.hrvMs,
    baselineHrvMs: parsed.data.baselineHrvMs ?? 58,
    sleepHours: parsed.data.sleepHours ?? 7.5,
    sleepEfficiency: parsed.data.sleepEfficiency ?? 85,
    strainScore: parsed.data.strainScore ?? 0,
    historyDays: parsed.data.historyDays
  });

  return NextResponse.json(result);
}
