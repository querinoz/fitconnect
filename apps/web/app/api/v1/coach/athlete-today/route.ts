import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/require-auth";
import { coachMayReadNutrition } from "@/lib/nutrition/coach-acl";
import { readSportsIdentity } from "@/lib/sport-intelligence/identity-repository";
import { listTrainingCompletions } from "@/lib/sport-intelligence/completion-repository";
import { adaptTodaySession } from "@/lib/sport-intelligence/adaptation-engine";
import { readinessFromApi } from "@/lib/train/readiness";

/**
 * Coach view of an authorized athlete.
 * Nutrition is opt-in only (share_with_coach).
 * Authorization for roster scope is currently identity-equality or explicit athleteId
 * with capability coach — full roster ACL remains product-owned.
 */
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const athleteId = url.searchParams.get("athleteId");
  if (!athleteId) {
    return NextResponse.json({ error: "athleteId_required" }, { status: 400 });
  }

  const isSelf = athleteId === auth.user.id;
  const isCoach = auth.user.role === "coach" || auth.capabilities.includes("coach");
  if (!isSelf && !isCoach) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Without a dedicated coach-athlete link table in this path, only self or
  // coach capability with explicit athleteId is accepted — still no cross-user
  // nutrition without opt-in.
  const coachAuthorizedForAthlete = isSelf || Boolean(isCoach);

  const { profile: identity } = await readSportsIdentity(athleteId);
  const history = await listTrainingCompletions(athleteId, 10);
  const card = adaptTodaySession({
    profile: identity,
    readiness: readinessFromApi({ score: null, source: "unauthorized" }),
    recentPlanIds: []
  });

  const nutrition = await coachMayReadNutrition({
    coachUserId: auth.user.id,
    athleteUserId: athleteId,
    coachAuthorizedForAthlete
  });

  return NextResponse.json({
    athleteId,
    identity: {
      primarySport: identity.primarySport,
      secondarySports: identity.secondarySports,
      primaryGoal: identity.primaryGoal,
      sportLevel: identity.sportLevel
    },
    today: {
      sportId: card.sportId,
      sessionType: card.session.sessionType,
      title: card.session.title,
      durationMin: card.session.durationMin,
      trainingLoadLabel: card.trainingLoadLabel,
      explanation: card.session.explanation
    },
    recentCompletions: history.sessions.slice(0, 5).map((s) => ({
      id: s.id,
      sportId: s.sportId,
      title: s.title,
      completedAtISO: s.completedAtISO,
      durationSec: s.durationSec,
      syncState: s.syncState
    })),
    nutrition: nutrition.allowed
      ? {
          allowed: true,
          reason: nutrition.reason,
          goal: nutrition.profile?.goal ?? null,
          logCount: nutrition.logs.length
        }
      : {
          allowed: false,
          reason: nutrition.reason,
          goal: null,
          logCount: 0
        },
    note: "Nutrition details withheld unless athlete share_with_coach is true."
  });
}
