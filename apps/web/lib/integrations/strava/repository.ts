/** @deprecated Use service.ts — thin re-exports for legacy imports. */
export {
  saveConnection as saveStravaConnection,
  getConnectionByAthlete as getStravaConnection,
  getConnectionByStravaAthleteId,
  listActivitiesForAthlete,
  listActivitiesForCoach,
  toIntegrationActivity,
  isStravaDbEnabled as isPrismaIntegrationsEnabled
} from "./service";

import { syncRecentActivities } from "./service";

export async function upsertStravaActivities(athleteExternalId: string) {
  return syncRecentActivities(athleteExternalId, 1);
}

export async function listStravaActivities(athleteExternalId: string, limit = 10) {
  const { listActivitiesForAthlete, toIntegrationActivity } = await import("./service");
  const rows = await listActivitiesForAthlete(athleteExternalId, limit);
  return rows.map(toIntegrationActivity);
}

export async function connectionFromPrisma(athleteExternalId: string) {
  const { getConnectionByAthlete } = await import("./service");
  const { decryptToken } = await import("./token-crypto");
  const row = await getConnectionByAthlete(athleteExternalId);
  if (!row || row.deauthorizedAt) return null;
  return {
    provider: "strava" as const,
    athleteId: athleteExternalId,
    status: "connected" as const,
    connectedAt: row.createdAt.toISOString(),
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    accessToken: decryptToken(row.accessToken),
    refreshToken: decryptToken(row.refreshToken),
    expiresAt: Math.floor(row.expiresAt.getTime() / 1000),
    externalAthleteId: String(row.stravaAthleteId)
  };
}
