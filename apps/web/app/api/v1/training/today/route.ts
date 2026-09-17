import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { adaptTodaySession } from "@/lib/sport-intelligence/adaptation-engine";
import { emptySportsIdentity } from "@/lib/sport-intelligence/sports-identity";
import { listSports } from "@/lib/sport-intelligence/sport-registry";
import { readinessFromApi } from "@/lib/train/readiness";

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
        safetyConstraints: s.safetyConstraints
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

  const profile = emptySportsIdentity(auth.user.id);
  // Prefer query sport for explicit user choice (no silent assumption)
  const sportParam = url.searchParams.get("sport");
  if (sportParam && listSports().some((s) => s.id === sportParam)) {
    profile.primarySport = sportParam as typeof profile.primarySport;
  }

  const card = adaptTodaySession({
    profile,
    readiness,
    recentPlanIds: [],
    timeAvailableMin: profile.sessionDurationMin ?? undefined
  });

  return NextResponse.json({
    view: "today",
    identityComplete: false,
    missingIdentity: ["primary_sport", "primary_goal"],
    today: card,
    honesty: {
      readiness: card.readinessState,
      note: "No fabricated biometrics. Nutrition fueling hint is contextual, not a logged meal."
    }
  });
}
