import {
  readNutritionProfile,
  listFoodLogsPersisted
} from "@/lib/nutrition/nutrition-repository";

/**
 * Coach may see nutrition only when athlete explicitly opted in (shareWithCoach).
 * Default: denied — never expose private diary.
 */
export async function coachMayReadNutrition(params: {
  coachUserId: string;
  athleteUserId: string;
  /** Caller must already have verified coach↔athlete authorization */
  coachAuthorizedForAthlete: boolean;
}): Promise<{
  allowed: boolean;
  reason: string;
  profile: Awaited<ReturnType<typeof readNutritionProfile>>["profile"] | null;
  logs: Awaited<ReturnType<typeof listFoodLogsPersisted>>["logs"];
}> {
  if (!params.coachAuthorizedForAthlete) {
    return {
      allowed: false,
      reason: "Coach is not authorized for this athlete.",
      profile: null,
      logs: []
    };
  }
  if (params.coachUserId === params.athleteUserId) {
    // Same identity (mode switch) — full access
    const { profile } = await readNutritionProfile(params.athleteUserId);
    const { logs } = await listFoodLogsPersisted(params.athleteUserId);
    return { allowed: true, reason: "Same identity.", profile, logs };
  }
  const { profile } = await readNutritionProfile(params.athleteUserId);
  if (!profile.shareWithCoach) {
    return {
      allowed: false,
      reason: "Athlete has not shared nutrition with coach (share_with_coach=false).",
      profile: null,
      logs: []
    };
  }
  const { logs } = await listFoodLogsPersisted(params.athleteUserId);
  return {
    allowed: true,
    reason: "Athlete opted in to share nutrition with authorized coach.",
    profile,
    logs
  };
}
