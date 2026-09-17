import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import {
  readNutritionProfile,
  upsertNutritionProfile
} from "@/lib/nutrition/nutrition-repository";
import type { NutritionGoal } from "@/lib/nutrition/types";

const GOALS = new Set<NutritionGoal>([
  "MUSCLE_GAIN",
  "FAT_LOSS",
  "BODY_RECOMPOSITION",
  "MAINTENANCE",
  "ENDURANCE",
  "PERFORMANCE",
  "ENERGY",
  "RECOVERY",
  "GENERAL_HEALTH"
]);

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const { profile, backend } = await readNutritionProfile(auth.user.id);
  return NextResponse.json({ profile, backend });
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  if (body.goal != null && !GOALS.has(body.goal as NutritionGoal)) {
    return NextResponse.json({ error: "unknown_goal" }, { status: 400 });
  }

  const saved = await upsertNutritionProfile(auth.user.id, {
    goal: (body.goal as NutritionGoal | null) ?? undefined,
    dietPattern: typeof body.dietPattern === "string" ? body.dietPattern : undefined,
    allergies: Array.isArray(body.allergies) ? (body.allergies as string[]) : undefined,
    intolerances: Array.isArray(body.intolerances) ? (body.intolerances as string[]) : undefined,
    dislikes: Array.isArray(body.dislikes) ? (body.dislikes as string[]) : undefined,
    religiousRestrictions: Array.isArray(body.religiousRestrictions)
      ? (body.religiousRestrictions as string[])
      : undefined,
    mealFrequency: body.mealFrequency != null ? Number(body.mealFrequency) : undefined,
    countryLocale: typeof body.countryLocale === "string" ? body.countryLocale : undefined,
    highRiskContext:
      typeof body.highRiskContext === "boolean" ? body.highRiskContext : undefined,
    declaredMedicalContext:
      typeof body.declaredMedicalContext === "boolean" ? body.declaredMedicalContext : undefined,
    bodyMassKg: body.bodyMassKg != null ? Number(body.bodyMassKg) : undefined,
    heightCm: body.heightCm != null ? Number(body.heightCm) : undefined,
    activityLevel: typeof body.activityLevel === "string" ? body.activityLevel : undefined,
    budget: typeof body.budget === "string" ? body.budget : undefined,
    prepTimeMin: body.prepTimeMin != null ? Number(body.prepTimeMin) : undefined,
    shareWithCoach: typeof body.shareWithCoach === "boolean" ? body.shareWithCoach : undefined
  });

  return NextResponse.json({ ok: true, profile: saved.profile, backend: saved.backend });
}
