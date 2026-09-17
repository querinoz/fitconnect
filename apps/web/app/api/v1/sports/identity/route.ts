import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  readSportsIdentity,
  upsertSportsIdentity
} from "@/lib/sport-intelligence/identity-repository";
import { profileCompleteness } from "@/lib/sport-intelligence/sports-identity";
import { SPORT_REGISTRY, type SportId, type AthleteGoal } from "@/lib/sport-intelligence/sport-registry";

const GOALS = new Set([
  "MUSCLE_GAIN",
  "FAT_LOSS",
  "BODY_RECOMPOSITION",
  "MAINTENANCE",
  "STRENGTH",
  "HYPERTROPHY",
  "POWER",
  "SPEED",
  "ENDURANCE",
  "AEROBIC_CAPACITY",
  "PERFORMANCE",
  "ENERGY",
  "RECOVERY",
  "GENERAL_FITNESS"
]);

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const { profile, backend } = await readSportsIdentity(auth.user.id);
  const completeness = profileCompleteness(profile);
  return NextResponse.json({
    profile,
    backend,
    ...completeness,
    note: "Server is source of truth; client cache is secondary."
  });
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  if (body.primarySport != null && !(String(body.primarySport) in SPORT_REGISTRY)) {
    return NextResponse.json({ error: "unknown_sport" }, { status: 400 });
  }
  if (body.primaryGoal != null && !GOALS.has(String(body.primaryGoal))) {
    return NextResponse.json({ error: "unknown_goal" }, { status: 400 });
  }

  const saved = await upsertSportsIdentity(auth.user.id, {
    primarySport: (body.primarySport as SportId | null) ?? undefined,
    secondarySports: Array.isArray(body.secondarySports)
      ? (body.secondarySports as SportId[])
      : undefined,
    sportLevel: (body.sportLevel as never) ?? undefined,
    trainingAgeYears:
      body.trainingAgeYears != null ? Number(body.trainingAgeYears) : undefined,
    trainingDaysPerWeek:
      body.trainingDaysPerWeek != null ? Number(body.trainingDaysPerWeek) : undefined,
    preferredTrainingDays: Array.isArray(body.preferredTrainingDays)
      ? (body.preferredTrainingDays as number[])
      : undefined,
    sessionDurationMin:
      body.sessionDurationMin != null ? Number(body.sessionDurationMin) : undefined,
    availableEquipment: Array.isArray(body.availableEquipment)
      ? (body.availableEquipment as string[])
      : undefined,
    trainingLocation: (body.trainingLocation as never) ?? undefined,
    competitiveStatus: (body.competitiveStatus as never) ?? undefined,
    competitionCalendar: Array.isArray(body.competitionCalendar)
      ? (body.competitionCalendar as never)
      : undefined,
    primaryGoal: (body.primaryGoal as AthleteGoal | null) ?? undefined,
    secondaryGoal: (body.secondaryGoal as AthleteGoal | null) ?? undefined
  });

  return NextResponse.json({
    ok: true,
    profile: saved.profile,
    backend: saved.backend,
    ...profileCompleteness(saved.profile)
  });
}
