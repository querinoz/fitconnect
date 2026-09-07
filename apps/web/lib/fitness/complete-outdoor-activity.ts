import { getPrisma, isDatabaseConfigured } from "@/lib/db/client";

export const OUTDOOR_ACTIVITY_PROVIDER = "GPS";

export type OutdoorRoutePoint = {
  lat: number;
  lon: number;
  t: number;
  acc?: number | null;
  spd?: number | null;
  alt?: number | null;
};

export type OutdoorActivityCompletionBody = {
  activityId: string;
  userId: string;
  sessionId: string;
  idempotencyKey: string;
  provider?: string;
  sport?: string;
  startedAtMs: number;
  completedAtMs: number;
  durationMs: number;
  metrics?: Record<string, unknown>;
  route?: OutdoorRoutePoint[];
};

export function assertOutdoorOwnership(actorId: string, bodyUserId: string): boolean {
  return Boolean(actorId) && actorId === bodyUserId;
}

export function assertOutdoorProvider(provider: string | undefined): boolean {
  const value = (provider ?? OUTDOOR_ACTIVITY_PROVIDER).toUpperCase();
  return value === "GPS";
}

export function assertOutdoorCoords(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Idempotent outdoor activity + route points.
 * Unique: (provider=GPS, external_id=sessionId).
 */
export async function upsertOutdoorActivityCompletion(
  body: OutdoorActivityCompletionBody
): Promise<{ activityId: string; duplicate: boolean; pointsWritten: number; source: "postgres" }> {
  const prisma = getPrisma();
  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("persistence_not_configured");
  }

  const provider = OUTDOOR_ACTIVITY_PROVIDER;
  const sport = (body.sport ?? "RUN").toUpperCase();
  const startedAt = new Date(body.startedAtMs).toISOString();
  const endedAt = new Date(body.completedAtMs).toISOString();
  const telemetry = JSON.stringify(body.metrics ?? {});
  const activityId = body.activityId || body.sessionId;
  const distanceM =
    typeof body.metrics?.distanceM === "number" ? body.metrics.distanceM : null;

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    select id from public.activities
    where provider = ${provider} and external_id = ${body.sessionId}
    limit 1
  `;
  const duplicate = existing.length > 0;
  const resolvedId = existing[0]?.id ?? activityId;

  await prisma.$executeRaw`
    insert into public.activities (
      id, user_id, provider, external_id, sport, started_at, ended_at,
      duration_ms, distance_m, visibility, telemetry, demo_labeled
    ) values (
      ${resolvedId}::uuid,
      ${body.userId},
      ${provider},
      ${body.sessionId},
      ${sport},
      ${startedAt}::timestamptz,
      ${endedAt}::timestamptz,
      ${body.durationMs},
      ${distanceM},
      'private',
      ${telemetry}::jsonb,
      false
    )
    on conflict (provider, external_id) do update set
      ended_at = excluded.ended_at,
      duration_ms = excluded.duration_ms,
      distance_m = excluded.distance_m,
      telemetry = excluded.telemetry,
      updated_at = now()
  `;

  const route = Array.isArray(body.route) ? body.route : [];
  let pointsWritten = 0;
  if (!duplicate && route.length > 0) {
    let seq = 0;
    for (const p of route) {
      if (!assertOutdoorCoords(p.lat, p.lon)) continue;
      seq += 1;
      const recordedAt = new Date(p.t || body.startedAtMs).toISOString();
      await prisma.$executeRaw`
        insert into public.activity_route_points (
          activity_id, recorded_at, latitude, longitude, accuracy_m, altitude_m, speed_mps, seq
        ) values (
          ${resolvedId}::uuid,
          ${recordedAt}::timestamptz,
          ${p.lat},
          ${p.lon},
          ${p.acc ?? null},
          ${p.alt ?? null},
          ${p.spd ?? null},
          ${seq}
        )
      `;
      pointsWritten += 1;
    }
  }

  return { activityId: resolvedId, duplicate, pointsWritten, source: "postgres" };
}
