import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { listAthleteEvents } from "@/lib/sports-intelligence/event-store";
import {
  buildAthleteContext,
  suggestLiveAdaptation
} from "@/lib/sports-intelligence/context-engine";
import { computeTrainingLoad } from "@/lib/sports-intelligence/training-load";
import { fetchSportsIdentity } from "@/lib/sport-intelligence/identity-store";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const events = listAthleteEvents(auth.user.id, { limit: 200 });
  const identity = await fetchSportsIdentity(auth.user.id).catch(() => null);

  const loadSessions = events
    .filter((e) => e.type === "WORKOUT_COMPLETED" || e.type === "SPORT_ACTIVITY_COMPLETED")
    .map((e) => ({
      dateISO: e.timestamp.slice(0, 10),
      strain:
        typeof e.payload.strain === "number"
          ? e.payload.strain
          : typeof e.payload.durationMin === "number"
            ? e.payload.durationMin
            : 0
    }))
    .filter((s) => s.strain > 0);

  const context = buildAthleteContext({
    userId: auth.user.id,
    events,
    primarySport: identity?.primarySport ?? null,
    goal: identity?.primaryGoal ?? null,
    loadSessions
  });

  const load = computeTrainingLoad(loadSessions);
  const adaptation = suggestLiveAdaptation(context);

  return NextResponse.json({
    context,
    trainingLoad: load,
    adaptationSuggestion: adaptation,
    note: "Adaptation is suggestion-only. TRAIN plan is never silently mutated."
  });
}
