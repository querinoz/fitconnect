import type { StravaSportType } from "@fitconnect/types";
import { resolveStravaSportType } from "@fitconnect/types";
import type { StravaDetailedActivityInput, StravaSummaryActivityInput } from "./schemas";

export type NormalizedStravaActivity = {
  stravaId: number;
  name: string;
  sportType: StravaSportType | string;
  legacyType: string | null;
  distanceM: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  elevationM: number | null;
  averageSpeed: number | null;
  maxSpeed: number | null;
  avgHr: number | null;
  maxHr: number | null;
  hasHeartrate: boolean;
  deviceName: string | null;
  startDate: Date;
  startDateLocal: Date;
  timezone: string | null;
  mapPolyline: string | null;
  mapSummaryPolyline: string | null;
  sufferScore: number | null;
  averageWatts: number | null;
  maxWatts: number | null;
  raw: Record<string, unknown>;
};

export function normalizeSummaryActivity(
  a: StravaSummaryActivityInput
): NormalizedStravaActivity {
  const sportType = resolveStravaSportType(a.sport_type, a.type);
  return {
    stravaId: a.id,
    name: a.name,
    sportType,
    legacyType: a.type ?? null,
    distanceM: a.distance,
    movingTimeSec: a.moving_time,
    elapsedTimeSec: a.elapsed_time,
    elevationM: a.total_elevation_gain ?? null,
    averageSpeed: a.average_speed ?? null,
    maxSpeed: a.max_speed ?? null,
    avgHr: a.average_heartrate ?? null,
    maxHr: a.max_heartrate ?? null,
    hasHeartrate: a.has_heartrate ?? Boolean(a.average_heartrate),
    deviceName: a.device_name ?? null,
    startDate: new Date(a.start_date),
    startDateLocal: new Date(a.start_date_local),
    timezone: a.timezone ?? null,
    mapPolyline: a.map?.polyline ?? null,
    mapSummaryPolyline: a.map?.summary_polyline ?? null,
    sufferScore: a.suffer_score ?? null,
    averageWatts: a.average_watts ?? null,
    maxWatts: a.max_watts ?? null,
    raw: a as Record<string, unknown>
  };
}

export function normalizeDetailedActivity(
  a: StravaDetailedActivityInput
): NormalizedStravaActivity & { laps: NonNullable<StravaDetailedActivityInput["laps"]> } {
  const base = normalizeSummaryActivity(a);
  return {
    ...base,
    laps: a.laps ?? []
  };
}

export function estimateTrainingLoad(movingTimeSec: number, avgHr?: number | null): number {
  const minutes = movingTimeSec / 60;
  const hr = avgHr ?? 140;
  return Math.round(minutes * (hr / 100) * 10) / 10;
}

export function formatSyncAgo(lastSyncAt: Date | null | undefined): string {
  if (!lastSyncAt) return "Never synced";
  const diffMs = Date.now() - lastSyncAt.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Synced just now";
  if (mins < 60) return `Synced ${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Synced ${hours}h ago`;
  return `Synced ${Math.floor(hours / 24)}d ago`;
}
