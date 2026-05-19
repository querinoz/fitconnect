import type { StravaTrpcService } from "@fitconnect/api-client/src/strava-service";
import {
  createStravaClientForAthlete,
  getConnectionByAthlete,
  listActivitiesForAthlete,
  syncActivityById,
  syncRecentActivities,
  toIntegrationActivity
} from "@/lib/integrations/strava/service";
import { normalizeDetailedActivity } from "@fitconnect/strava-integration";

export function createStravaTrpcService(): StravaTrpcService {
  return {
    async listActivities(athleteId, limit = 10) {
      const rows = await listActivitiesForAthlete(athleteId, limit);
      return rows.map((r) => {
        const m = toIntegrationActivity(r);
        return {
          id: m.id,
          name: m.name,
          sportType: m.type,
          distanceM: m.distanceM,
          movingTimeSec: m.movingTimeSec,
          startDate: m.startDate,
          avgHr: m.avgHr,
          mapPolyline: m.mapPolyline
        };
      });
    },

    async getActivity(athleteId, stravaId) {
      const rows = await listActivitiesForAthlete(athleteId, 50);
      const row = rows.find((r) => r.stravaId === stravaId);
      if (!row) {
        await syncActivityById(athleteId, stravaId);
      }
      const updated = (await listActivitiesForAthlete(athleteId, 50)).find(
        (r) => r.stravaId === stravaId
      );
      if (!updated) return { activity: null };

      return {
        activity: normalizeDetailedActivity({
          id: updated.stravaId,
          name: updated.name,
          sport_type: updated.sportType,
          type: updated.legacyType ?? undefined,
          distance: updated.distanceM,
          moving_time: updated.movingTimeSec,
          elapsed_time: updated.elapsedTimeSec,
          start_date: updated.startDate.toISOString(),
          start_date_local: (updated.startDateLocal ?? updated.startDate).toISOString(),
          average_heartrate: updated.avgHr,
          max_heartrate: updated.maxHr,
          total_elevation_gain: updated.elevationM,
          map: {
            id: String(updated.stravaId),
            summary_polyline: updated.mapSummaryPolyline,
            polyline: updated.mapPolyline
          }
        }),
        streams: (updated.streamsJson as Record<string, unknown>) ?? undefined
      };
    },

    async sync(athleteId) {
      const batch = await syncRecentActivities(athleteId, 2);
      return { count: batch.length };
    },

    async connectionStatus(athleteId) {
      const conn = await getConnectionByAthlete(athleteId);
      return {
        connected: Boolean(conn && !conn.deauthorizedAt),
        lastSyncAt: conn?.lastSyncAt?.toISOString() ?? null
      };
    }
  };
}

export async function getStravaClientForAthlete(athleteId: string) {
  return createStravaClientForAthlete(athleteId);
}
