import { resolveCanonicalLevel } from "@/lib/ascend/canonical-levels";
import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { pgQuery } from "@/lib/db/pg-pool";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import type { ApplyEventResult, ProgressionEvent, ProgressionSnapshot } from "@/lib/progression/server-store";

type ProgressRow = {
  user_id: string;
  total_xp: number;
  streak_days: number;
  badges: string[] | unknown;
  updated_at: string;
};

const DEFAULT_XP = 120;

function snapshotFromRow(row: ProgressRow): ProgressionSnapshot {
  return {
    userId: row.user_id,
    totalXp: row.total_xp,
    level: resolveCanonicalLevel(row.total_xp),
    streakDays: row.streak_days,
    badges: Array.isArray(row.badges) ? (row.badges as string[]) : [],
    processedEventIds: [],
    updatedAt: row.updated_at
  };
}

function xpForEvent(event: ProgressionEvent): number {
  if (typeof event.xpAward === "number" && event.xpAward > 0) return event.xpAward;
  if (event.type === "MISSION_COMPLETED") return 25;
  const distanceM = event.payload?.distanceM ?? 0;
  return Math.max(15, Math.round(distanceM / 100));
}

async function readProgressRow(userId: string): Promise<ProgressRow | null> {
  const admin = createSupabaseAdminClient();
  if (admin) {
    const { data } = await admin
      .from("ascend_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return (data as ProgressRow | null) ?? null;
  }
  const rows = await pgQuery<ProgressRow>(
    `select * from public.ascend_progress where user_id = $1`,
    [userId]
  );
  return rows[0] ?? null;
}

async function insertProgressRow(row: ProgressRow) {
  const admin = createSupabaseAdminClient();
  if (admin) {
    await admin.from("ascend_progress").insert(row);
    return;
  }
  await pgQuery(
    `insert into public.ascend_progress (user_id, total_xp, streak_days, badges, updated_at)
     values ($1, $2, $3, $4::jsonb, $5)`,
    [row.user_id, row.total_xp, row.streak_days, JSON.stringify(row.badges ?? []), row.updated_at]
  );
}

export async function getProgressionFromSupabase(userId: string): Promise<ProgressionSnapshot> {
  const existing = await readProgressRow(userId);
  if (existing) return snapshotFromRow(existing);

  const now = new Date().toISOString();
  const row: ProgressRow = {
    user_id: userId,
    total_xp: DEFAULT_XP,
    streak_days: 0,
    badges: [],
    updated_at: now
  };
  await insertProgressRow(row);
  return snapshotFromRow(row);
}

export async function applyProgressionEventInSupabase(
  userId: string,
  event: ProgressionEvent,
  accessToken: string
): Promise<ApplyEventResult> {
  const client = createSupabaseRlsClient(accessToken);
  const current = await getProgressionFromSupabase(userId);

  const existingEvent = client
    ? (
        await client
          .from("ascend_events")
          .select("event_id")
          .eq("user_id", userId)
          .eq("event_id", event.eventId)
          .maybeSingle()
      ).data
    : (
        await pgQuery<{ event_id: string }>(
          `select event_id from public.ascend_events where user_id = $1 and event_id = $2`,
          [userId, event.eventId]
        )
      )[0];

  if (existingEvent) {
    return {
      status: "DUPLICATE",
      awardedXp: 0,
      snapshot: current,
      leveledUp: false
    };
  }

  const prevLevel = current.level.level;
  const awardedXp = xpForEvent(event);
  const totalXp = current.totalXp + awardedXp;
  const now = new Date().toISOString();

  if (client) {
    await client.from("ascend_events").insert({
      event_id: event.eventId,
      user_id: userId,
      event_type: event.type,
      xp_awarded: awardedXp,
      payload: event.payload ?? {}
    });
    await client.from("ascend_progress").upsert({
      user_id: userId,
      total_xp: totalXp,
      streak_days: current.streakDays,
      badges: current.badges,
      updated_at: now
    });
  } else {
    await pgQuery(
      `insert into public.ascend_events (event_id, user_id, event_type, xp_awarded, payload)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [event.eventId, userId, event.type, awardedXp, JSON.stringify(event.payload ?? {})]
    );
    await pgQuery(
      `insert into public.ascend_progress (user_id, total_xp, streak_days, badges, updated_at)
       values ($1, $2, $3, $4::jsonb, $5)
       on conflict (user_id) do update set
         total_xp = excluded.total_xp,
         streak_days = excluded.streak_days,
         badges = excluded.badges,
         updated_at = excluded.updated_at`,
      [userId, totalXp, current.streakDays, JSON.stringify(current.badges), now]
    );
  }

  const snapshot: ProgressionSnapshot = {
    ...current,
    totalXp,
    level: resolveCanonicalLevel(totalXp),
    updatedAt: now
  };

  return {
    status: "APPLIED",
    awardedXp,
    snapshot,
    leveledUp: snapshot.level.level > prevLevel
  };
}
