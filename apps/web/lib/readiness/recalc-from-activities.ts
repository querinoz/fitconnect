import { computeReadiness, hasCompleteReadinessInputs } from "@/lib/readiness/compute";
import { getPrisma } from "@/lib/db/client";
import { listStravaActivities } from "@/lib/integrations/strava/repository";

export async function recalcReadinessFromActivities(athleteExternalId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const athlete = await prisma.athleteProfile.findUnique({
    where: { externalId: athleteExternalId }
  });
  if (!athlete) return null;

  const activities = await listStravaActivities(athleteExternalId, 7);
  const recentLoad = activities.reduce((s, a) => s + a.movingTimeSec / 60, 0);
  const strainScore = Math.min(100, Math.round(recentLoad / 3));

  const sleepHours = Number.parseFloat(athlete.sleepHours);
  const input = {
    hrvMs: athlete.hrv,
    baselineHrvMs: athlete.hrv,
    sleepHours,
    sleepEfficiency: athlete.sleepEfficiency,
    strainScore
  };
  if (!hasCompleteReadinessInputs(input) || !Number.isFinite(athlete.hrv) || athlete.hrv <= 0) {
    return null;
  }
  const score = computeReadiness(input);

  await prisma.athleteProfile.update({
    where: { externalId: athleteExternalId },
    data: { readiness: score.score }
  });

  await prisma.readinessSnapshot.create({
    data: {
      athleteExternalId,
      score: score.score,
      hrvMs: athlete.hrv,
      sleepHours: athlete.sleepHours,
      sleepEfficiency: athlete.sleepEfficiency,
      recoveryStatus: athlete.recoveryStatus
    }
  });

  return score;
}
