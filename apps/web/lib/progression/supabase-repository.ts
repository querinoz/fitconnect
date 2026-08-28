import { resolveCanonicalLevel } from "@/lib/ascend/canonical-levels";
import { createSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { createSupabaseRlsClient } from "@/lib/identity/supabase-rls-client";
import type { ApplyEventResult, ProgressionEvent, ProgressionSnapshot } from "@/lib/progression/server-store";

type ProgressRow = {
  user_id: string;
  total_xp: number;
  streak_days: number;
  badges: string[];
  updated_at: string;
};

const DEFAULT_XP = 120;

function snapshotFromRow(row: ProgressRow): ProgressionSnapshot {
  return {
    userId: row.user_id,
    totalXp: row.total_xp,
    level: resolveCanonicalLevel(row.total_xp),
    streakDays: row.streak_days,
    badges: Array.isArray(row.badges) ? row.badges : [],
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

export async function getProgressionFromSupabase(userId: string): Promise<ProgressionSnapshot> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return {
      userId,
      totalXp: DEFAULT_XP,
      level: resolveCanonicalLevel(DEFAULT_XP),
      streakDays: 0,
      badges: [],
      processedEventIds: [],
      updatedAt: new Date().toISOString()
    };
  }

  const { data } = await admin
    .from("ascend_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    const now = new Date().toISOString();
    const row: ProgressRow = {
      user_id: userId,
      total_xp: DEFAULT_XP,
      streak_days: 0,
      badges: [],
      updated_at: now
    };
    await admin.from("ascend_progress").insert(row);
    return snapshotFromRow(row);
  }

  return snapshotFromRow(data as ProgressRow);
}

export async function applyProgressionEventInSupabase(
  userId: string,
  event: ProgressionEvent,
  accessToken: string
): Promise<ApplyEventResult> {
  const client = createSupabaseRlsClient(accessToken);
  if (!client) {
    return {
      status: "DUPLICATE",
      awardedXp: 0,
      snapshot: await getProgressionFromSupabase(userId),
      leveledUp: false
    };
  }

  const { data: existingEvent } = await client
    .from("ascend_events")
    .select("event_id")
    .eq("user_id", userId)
    .eq("event_id", event.eventId)
    .maybeSingle();

  const current = await getProgressionFromSupabase(userId);
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
