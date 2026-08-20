import type { Prisma } from "@prisma/client";
import {
  StravaClient,
  normalizeDetailedActivity,
  normalizeSummaryActivity,
  estimateTrainingLoad,
  indexStreamsByType,
  type NormalizedStravaActivity
} from "@fitconnect/strava-integration";
import type { StravaDetailedActivity, StravaSummaryActivity } from "@fitconnect/types";
import { getPrisma, isDatabaseConfigured } from "@/lib/db/client";
import { decryptToken, encryptToken } from "./token-crypto";
import { setStravaRateLimit } from "./rate-limit-cache";

export async function getConnectionByAthlete(athleteExternalId: string) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.stravaConnection.findUnique({ where: { athleteExternalId } });
}

export async function getConnectionByStravaAthleteId(stravaAthleteId: number) {
  const prisma = getPrisma();
  if (!prisma) return null;
  return prisma.stravaConnection.findUnique({ where: { stravaAthleteId } });
}

export async function saveConnection(input: {
  athleteExternalId: string;
  stravaAthleteId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope?: string;
}) {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    await prisma.stravaConnection.deleteMany({
      where: {
        stravaAthleteId: input.stravaAthleteId,
        athleteExternalId: { not: input.athleteExternalId }
      }
    });

    return await prisma.stravaConnection.upsert({
    where: { athleteExternalId: input.athleteExternalId },
    create: {
      athleteExternalId: input.athleteExternalId,
      stravaAthleteId: input.stravaAthleteId,
      accessToken: encryptToken(input.accessToken),
      refreshToken: encryptToken(input.refreshToken),
      expiresAt: new Date(input.expiresAt * 1000),
      scope: input.scope ?? "read,activity:read,activity:read_all,profile:read_all",
      lastSyncAt: new Date(),
      deauthorizedAt: null
    },
    update: {
      stravaAthleteId: input.stravaAthleteId,
      accessToken: encryptToken(input.accessToken),
      refreshToken: encryptToken(input.refreshToken),
      expiresAt: new Date(input.expiresAt * 1000),
      lastSyncAt: new Date(),
      deauthorizedAt: null
    }
  });
  } catch (err) {
    console.error("[strava] saveConnection failed:", err);
    return null;
  }
}

export async function markDeauthorized(stravaAthleteId: number) {
  const prisma = getPrisma();
  if (!prisma) return;
  const conn = await prisma.stravaConnection.findFirst({
    where: { stravaAthleteId }
  });
  if (conn) {
    await prisma.stravaActivity.deleteMany({
      where: { athleteExternalId: conn.athleteExternalId }
    });
  }
  await prisma.stravaConnection.deleteMany({
    where: { stravaAthleteId }
  });
}

export function stravaRevocationPurgePlan(athleteExternalId: string) {
  return {
    athleteExternalId,
    deleteActivities: true,
    deleteLaps: true,
    deleteSegmentEfforts: true,
    deleteConnectionAndTokens: true
  } as const;
}

export function createStravaClientForAthlete(athleteExternalId: string): StravaClient | null {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  let cachedConn: Awaited<ReturnType<typeof getConnectionByAthlete>> = null;

  return new StravaClient({
    clientId,
    clientSecret,
    onRateLimit: (limits) => setStravaRateLimit(limits),
    getAccessToken: async () => {
      cachedConn = await getConnectionByAthlete(athleteExternalId);
      if (!cachedConn || cachedConn.deauthorizedAt) return null;
      if (cachedConn.expiresAt.getTime() < Date.now()) {
        const refreshed = await StravaClient.refreshAccessToken(
          clientId,
          clientSecret,
          decryptToken(cachedConn.refreshToken)
        );
        if (refreshed) {
          await saveConnection({
            athleteExternalId,
            stravaAthleteId: cachedConn.stravaAthleteId,
            accessToken: refreshed.access_token,
            refreshToken: refreshed.refresh_token,
            expiresAt: refreshed.expires_at,
            scope: cachedConn.scope
          });
          return refreshed.access_token;
        }
      }
      return decryptToken(cachedConn.accessToken);
    },
    refreshToken: async () => {
      const conn = cachedConn ?? (await getConnectionByAthlete(athleteExternalId));
      if (!conn) return null;
      const refreshed = await StravaClient.refreshAccessToken(
        clientId,
        clientSecret,
        decryptToken(conn.refreshToken)
      );
      if (!refreshed) return null;
      await saveConnection({
        athleteExternalId,
        stravaAthleteId: conn.stravaAthleteId,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: refreshed.expires_at,
        scope: conn.scope
      });
      return refreshed;
    }
  });
}

export async function upsertNormalizedActivity(
  athleteExternalId: string,
  normalized: NormalizedStravaActivity,
  extras?: {
    streamsJson?: unknown;
    laps?: Array<{
      id?: number;
      lap_index: number;
      name: string;
      distance: number;
      moving_time: number;
      elapsed_time: number;
      average_heartrate?: number | null;
      max_heartrate?: number | null;
      total_elevation_gain?: number | null;
    }>;
    segmentEfforts?: Array<{
      id: number;
      name: string;
      elapsed_time: number;
      moving_time: number;
      distance: number;
      pr_rank?: number | null;
      kom_rank?: number | null;
      segment?: { id: number };
    }>;
  }
) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const loadScore = estimateTrainingLoad(normalized.movingTimeSec, normalized.avgHr);

  const activity = await prisma.stravaActivity.upsert({
    where: { stravaId: normalized.stravaId },
    create: {
      stravaId: normalized.stravaId,
      athleteExternalId,
      name: normalized.name,
      sportType: String(normalized.sportType),
      legacyType: normalized.legacyType,
      startDate: normalized.startDate,
      startDateLocal: normalized.startDateLocal,
      timezone: normalized.timezone,
      distanceM: normalized.distanceM,
      movingTimeSec: normalized.movingTimeSec,
      elapsedTimeSec: normalized.elapsedTimeSec,
      avgHr: normalized.avgHr,
      maxHr: normalized.maxHr,
      elevationM: normalized.elevationM,
      averageSpeed: normalized.averageSpeed,
      maxSpeed: normalized.maxSpeed,
      hasHeartrate: normalized.hasHeartrate,
      deviceName: normalized.deviceName,
      mapPolyline: normalized.mapPolyline,
      mapSummaryPolyline: normalized.mapSummaryPolyline,
      sufferScore: normalized.sufferScore,
      averageWatts: normalized.averageWatts,
      maxWatts: normalized.maxWatts,
      loadScore,
      streamsJson: (extras?.streamsJson ?? undefined) as Prisma.InputJsonValue | undefined,
      rawData: normalized.raw as Prisma.InputJsonValue,
      deletedAt: null
    },
    update: {
      name: normalized.name,
      sportType: String(normalized.sportType),
      legacyType: normalized.legacyType,
      startDate: normalized.startDate,
      startDateLocal: normalized.startDateLocal,
      timezone: normalized.timezone,
      distanceM: normalized.distanceM,
      movingTimeSec: normalized.movingTimeSec,
      elapsedTimeSec: normalized.elapsedTimeSec,
      avgHr: normalized.avgHr,
      maxHr: normalized.maxHr,
      elevationM: normalized.elevationM,
      averageSpeed: normalized.averageSpeed,
      maxSpeed: normalized.maxSpeed,
      hasHeartrate: normalized.hasHeartrate,
      deviceName: normalized.deviceName,
      mapPolyline: normalized.mapPolyline,
      mapSummaryPolyline: normalized.mapSummaryPolyline,
      sufferScore: normalized.sufferScore,
      averageWatts: normalized.averageWatts,
      maxWatts: normalized.maxWatts,
      loadScore,
      streamsJson: (extras?.streamsJson ?? undefined) as Prisma.InputJsonValue | undefined,
      rawData: normalized.raw as Prisma.InputJsonValue,
      deletedAt: null,
      syncedAt: new Date()
    }
  });

  if (extras?.laps?.length) {
    await prisma.stravaActivityLap.deleteMany({ where: { activityId: activity.id } });
    await prisma.stravaActivityLap.createMany({
      data: extras.laps.map((lap) => ({
        activityId: activity.id,
        stravaLapId: lap.id ?? null,
        lapIndex: lap.lap_index,
        name: lap.name,
        distanceM: lap.distance,
        movingTimeSec: lap.moving_time,
        elapsedTimeSec: lap.elapsed_time,
        avgHr: lap.average_heartrate ?? null,
        maxHr: lap.max_heartrate ?? null,
        elevationM: lap.total_elevation_gain ?? null
      }))
    });
  }

  if (extras?.segmentEfforts?.length) {
    for (const effort of extras.segmentEfforts) {
      await prisma.stravaSegmentEffort.upsert({
        where: { stravaEffortId: effort.id },
        create: {
          stravaEffortId: effort.id,
          activityId: activity.id,
          segmentId: effort.segment?.id ?? null,
          name: effort.name,
          elapsedTimeSec: effort.elapsed_time,
          movingTimeSec: effort.moving_time,
          distanceM: effort.distance,
          prRank: effort.pr_rank ?? null,
          komRank: effort.kom_rank ?? null
        },
        update: {
          name: effort.name,
          elapsedTimeSec: effort.elapsed_time,
          movingTimeSec: effort.moving_time,
          distanceM: effort.distance,
          prRank: effort.pr_rank ?? null,
          komRank: effort.kom_rank ?? null
        }
      });
    }
  }

  await prisma.stravaConnection.update({
    where: { athleteExternalId },
    data: { lastSyncAt: new Date() }
  });

  return activity;
}

export async function softDeleteActivity(stravaId: number) {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.stravaActivity.updateMany({
    where: { stravaId },
    data: { deletedAt: new Date() }
  });
}

export async function syncActivityById(athleteExternalId: string, activityId: number) {
  const client = createStravaClientForAthlete(athleteExternalId);
  if (!client) return null;

  const detailed = await client.getActivity(activityId, true);
  const normalized = normalizeDetailedActivity(detailed as Parameters<typeof normalizeDetailedActivity>[0]);

  let streamsJson: unknown;
  try {
    const streams = await client.getActivityStreams(activityId);
    streamsJson = indexStreamsByType(streams);
  } catch {
    streamsJson = undefined;
  }

  return upsertNormalizedActivity(athleteExternalId, normalized, {
    streamsJson,
    laps: detailed.laps,
    segmentEfforts: (detailed.segment_efforts ?? undefined) as NonNullable<
      Parameters<typeof upsertNormalizedActivity>[2]
    >["segmentEfforts"]
  });
}

export async function syncRecentActivities(athleteExternalId: string, pages = 2) {
  const client = createStravaClientForAthlete(athleteExternalId);
  if (!client) return [];

  const results: NormalizedStravaActivity[] = [];
  for (let page = 1; page <= pages; page++) {
    const batch = await client.listActivities({ page, perPage: 30 });
    for (const row of batch) {
      const normalized = normalizeSummaryActivity(
        row as Parameters<typeof normalizeSummaryActivity>[0]
      );
      await upsertNormalizedActivity(athleteExternalId, normalized);
      results.push(normalized);
    }
    if (batch.length < 30) break;
  }
  return results;
}

export async function listActivitiesForAthlete(athleteExternalId: string, limit = 10) {
  const prisma = getPrisma();
  if (!prisma) return [];

  return prisma.stravaActivity.findMany({
    where: { athleteExternalId, deletedAt: null },
    orderBy: { startDate: "desc" },
    take: limit,
    include: { laps: true, segmentEfforts: true }
  });
}

export async function listActivitiesForCoach(
  _coachExternalId?: string,
  limit = 20
): Promise<never> {
  void limit;
  throw new Error("strava_not_shareable");
}

export async function purgeStravaForAthlete(athleteExternalId: string): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;
  await prisma.stravaActivity.deleteMany({ where: { athleteExternalId } });
  await prisma.stravaConnection.deleteMany({ where: { athleteExternalId } });
}

export function isStravaDbEnabled(): boolean {
  return isDatabaseConfigured();
}

/** Back-compat mapper for IntegrationActivity shape used by UI store. */
export function toIntegrationActivity(row: {
  stravaId: number;
  name: string;
  sportType: string;
  distanceM: number;
  movingTimeSec: number;
  startDate: Date;
  avgHr: number | null;
  elevationM: number | null;
  mapSummaryPolyline?: string | null;
}) {
  return {
    id: String(row.stravaId),
    provider: "strava" as const,
    name: row.name,
    type: row.sportType,
    distanceM: row.distanceM,
    movingTimeSec: row.movingTimeSec,
    startDate: row.startDate.toISOString(),
    avgHr: row.avgHr ?? undefined,
    elevationGainM: row.elevationM ?? undefined,
    mapPolyline: row.mapSummaryPolyline ?? undefined
  };
}

export type { StravaSummaryActivity, StravaDetailedActivity };
