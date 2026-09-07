import { getPrisma, isDatabaseConfigured } from "@/lib/db/client";

export const GUIDED_ACTIVITY_PROVIDER = "MANUAL";
export const GUIDED_ACTIVITY_SPORT = "STRENGTH";

export type GuidedWorkoutCompletionBody = {
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
  metadata?: Record<string, unknown>;
};

export function assertGuidedOwnership(actorId: string, bodyUserId: string): boolean {
  return Boolean(actorId) && actorId === bodyUserId;
}

export function assertGuidedProvider(provider: string | undefined): boolean {
  const value = (provider ?? GUIDED_ACTIVITY_PROVIDER).toUpperCase();
  return value !== "STRAVA" && value === "MANUAL";
}

/**
 * Idempotent upsert into public.activities + strength_sessions.
 * Unique key: (provider, external_id) where external_id = sessionId.
 */
export async function upsertGuidedWorkoutCompletion(
  body: GuidedWorkoutCompletionBody
): Promise<{ activityId: string; duplicate: boolean; source: "postgres" }> {
  const prisma = getPrisma();
  if (!prisma || !isDatabaseConfigured()) {
    throw new Error("persistence_not_configured");
  }

  const provider = GUIDED_ACTIVITY_PROVIDER;
  const sport = body.sport ?? GUIDED_ACTIVITY_SPORT;
  const startedAt = new Date(body.startedAtMs).toISOString();
  const endedAt = new Date(body.completedAtMs).toISOString();
  const telemetry = JSON.stringify(body.metrics ?? {});
  const activityId = body.activityId || body.sessionId;

  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    select id from public.activities
    where provider = ${provider} and external_id = ${body.sessionId}
    limit 1
  `;
  const duplicate = existing.length > 0;

  await prisma.$executeRaw`
    insert into public.activities (
      id, user_id, provider, external_id, sport, started_at, ended_at,
      duration_ms, visibility, telemetry, demo_labeled
    ) values (
      ${activityId}::uuid,
      ${body.userId},
      ${provider},
      ${body.sessionId},
      ${sport},
      ${startedAt}::timestamptz,
      ${endedAt}::timestamptz,
      ${body.durationMs},
      'private',
      ${telemetry}::jsonb,
      false
    )
    on conflict (provider, external_id) do update set
      ended_at = excluded.ended_at,
      duration_ms = excluded.duration_ms,
      telemetry = excluded.telemetry,
      updated_at = now()
  `;

  await prisma.$executeRaw`
    insert into public.strength_sessions (
      id, user_id, activity_id, status, started_at, completed_at, duration_ms, idempotency_key
    ) values (
      ${body.sessionId}::uuid,
      ${body.userId},
      ${activityId}::uuid,
      'COMPLETED',
      ${startedAt}::timestamptz,
      ${endedAt}::timestamptz,
      ${body.durationMs},
      ${body.idempotencyKey}
    )
    on conflict (id) do update set
      activity_id = excluded.activity_id,
      status = 'COMPLETED',
      completed_at = excluded.completed_at,
      duration_ms = excluded.duration_ms,
      idempotency_key = excluded.idempotency_key,
      updated_at = now()
  `;

  return { activityId, duplicate, source: "postgres" };
}
