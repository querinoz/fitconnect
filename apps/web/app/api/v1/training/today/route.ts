import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { adaptTodaySession } from "@/lib/sport-intelligence/adaptation-engine";
import { emptySportsIdentity, profileCompleteness } from "@/lib/sport-intelligence/sports-identity";
import { readSportsIdentity } from "@/lib/sport-intelligence/identity-repository";
import { listTrainingCompletions } from "@/lib/sport-intelligence/completion-repository";
import { listSports } from "@/lib/sport-intelligence/sport-registry";
import { readinessFromApi } from "@/lib/train/readiness";
import { readNutritionProfile } from "@/lib/nutrition/nutrition-repository";
import { planDailyTargets } from "@/lib/nutrition/planning-engine";
import { getSport } from "@/lib/sport-intelligence/sport-registry";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "today";

  if (view === "sports") {
    return NextResponse.json({
      sports: listSports().map((s) => ({
        id: s.id,
        label: s.label,
        sessionTypes: s.sessionTypes,
        primaryMetrics: s.primaryMetrics,
        progressionStrategy: s.progressionStrategy,
        safetyConstraints: s.safetyConstraints,
        nutritionProfileKey: s.nutritionProfileKey
      }))
    });
  }

  let readiness = readinessFromApi({ score: null, source: "unauthorized" });
  try {
    const res = await fetch(new URL("/api/v1/readiness", request.url), {
      headers: request.headers
    });
    if (res.ok) {
      const body = (await res.json()) as { score?: number | null; source?: string };
      readiness = readinessFromApi(body);
    } else {
      readiness = readinessFromApi({ score: null, source: "unauthorized" });
    }
  } catch {
    readiness = readinessFromApi({ score: null, source: "offline" });
  }

  const { profile, backend } = await readSportsIdentity(auth.user.id);
  const identity = profile.primarySport ? profile : emptySportsIdentity(auth.user.id);
  // Prefer query sport for explicit user choice (no silent assumption)
  const sportParam = url.searchParams.get("sport");
  if (sportParam && listSports().some((s) => s.id === sportParam)) {
    identity.primarySport = sportParam as typeof identity.primarySport;
  } else if (profile.primarySport) {
    identity.primarySport = profile.primarySport;
    identity.secondarySports = profile.secondarySports;
    identity.primaryGoal = profile.primaryGoal;
    identity.sessionDurationMin = profile.sessionDurationMin;
    identity.availableEquipment = profile.availableEquipment;
  }

  const history = await listTrainingCompletions(auth.user.id, 10);
  const recentPlanIds = history.sessions
    .map((s) => (typeof s.payload.legacyPlanId === "string" ? s.payload.legacyPlanId : null))
    .filter((x): x is string => Boolean(x));

  const card = adaptTodaySession({
    profile: identity,
    readiness,
    recentPlanIds,
    timeAvailableMin: identity.sessionDurationMin ?? undefined
  });

  const nutrition = await readNutritionProfile(auth.user.id);
  const sport = getSport(card.sportId);
  const dayKind =
    card.trainingLoadLabel === "HIGH" ? "hard" : card.trainingLoadLabel === "LOW" ? "easy" : "moderate";
  const targets = planDailyTargets({
    profile: nutrition.profile,
    sportNutritionKey: sport.nutritionProfileKey,
    trainingDayKind: dayKind,
    bodyMassKg: nutrition.profile.bodyMassKg,
    sessionDurationMin: card.session.durationMin
  });

  const completeness = profileCompleteness(identity);

  return NextResponse.json({
    view: "today",
    identity,
    identityBackend: backend,
    identityComplete: completeness.complete,
    missingIdentity: completeness.missing,
    today: card,
    nutritionContext: {
      estimateKind: targets.estimateKind,
      confidence: targets.confidence,
      kcal: targets.kcal,
      proteinG: targets.proteinG,
      carbohydrateG: targets.carbohydrateG,
      fatG: targets.fatG,
      hydrationMl: targets.hydrationMl,
      fuelingHint: card.fuelingHint,
      safetyFlags: targets.safetyFlags,
      explanations: targets.explanations
    },
    recentCompletions: history.sessions.slice(0, 5),
    honesty: {
      readiness: card.readinessState,
      nutrition: targets.estimateKind,
      note: "No fabricated biometrics. Nutrition is ESTIMATE context, not a logged meal."
    }
  });
}
