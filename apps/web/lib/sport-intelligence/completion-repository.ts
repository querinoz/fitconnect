import { getPgPool } from "@/lib/db/pg-pool";
import { persistenceReady } from "@/lib/persistence/config";
import type { PersistenceBackend } from "@/lib/sport-intelligence/identity-repository";
import type { SportId } from "@/lib/sport-intelligence/sport-registry";

export type TrainingCompletion = {
  id: string;
  userId: string;
  sportId: SportId | string;
  sessionType: string;
  title: string;
  startedAtISO: string;
  completedAtISO: string;
  durationSec: number;
  blocksCompleted: number;
  payload: Record<string, unknown>;
  trainingLoadLabel: string | null;
  rpe: number | null;
  notes: string | null;
  syncState: "SYNCED" | "SYNCING" | "OFFLINE" | "QUEUED" | "CONFLICT" | "ERROR";
};

const mem = new Map<string, TrainingCompletion[]>();

export async function saveTrainingCompletion(
  entry: TrainingCompletion
): Promise<{ backend: PersistenceBackend; syncState: TrainingCompletion["syncState"] }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      await pool.query(
        `insert into public.sport_training_completions (
           id, user_id, sport_id, session_type, title, started_at, completed_at,
           duration_sec, blocks_completed, payload, training_load_label, rpe, notes, sync_state
         ) values (
           $1,$2,$3,$4,$5,$6::timestamptz,$7::timestamptz,$8,$9,$10::jsonb,$11,$12,$13,'SYNCED'
         )
         on conflict (id) do update set
           completed_at = excluded.completed_at,
           duration_sec = excluded.duration_sec,
           blocks_completed = excluded.blocks_completed,
           payload = excluded.payload,
           rpe = excluded.rpe,
           notes = excluded.notes,
           sync_state = 'SYNCED'`,
        [
          entry.id,
          entry.userId,
          entry.sportId,
          entry.sessionType,
          entry.title,
          entry.startedAtISO,
          entry.completedAtISO,
          entry.durationSec,
          entry.blocksCompleted,
          JSON.stringify(entry.payload),
          entry.trainingLoadLabel,
          entry.rpe,
          entry.notes
        ]
      );
      const list = mem.get(entry.userId) ?? [];
      list.unshift({ ...entry, syncState: "SYNCED" });
      mem.set(entry.userId, list.slice(0, 100));
      return { backend: "postgres", syncState: "SYNCED" };
    } catch {
      /* queue offline */
    }
  }
  const queued = { ...entry, syncState: "QUEUED" as const };
  const list = mem.get(entry.userId) ?? [];
  list.unshift(queued);
  mem.set(entry.userId, list.slice(0, 100));
  return { backend: "memory", syncState: "QUEUED" };
}

export async function listTrainingCompletions(
  userId: string,
  limit = 30
): Promise<{ sessions: TrainingCompletion[]; backend: PersistenceBackend }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      const { rows } = await pool.query(
        `select id, user_id, sport_id, session_type, title, started_at::text, completed_at::text,
                duration_sec, blocks_completed, payload, training_load_label, rpe, notes, sync_state
         from public.sport_training_completions
         where user_id = $1
         order by completed_at desc
         limit $2`,
        [userId, limit]
      );
      return {
        backend: "postgres",
        sessions: rows.map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            userId: String(row.user_id),
            sportId: String(row.sport_id),
            sessionType: String(row.session_type),
            title: String(row.title),
            startedAtISO: String(row.started_at),
            completedAtISO: String(row.completed_at),
            durationSec: Number(row.duration_sec),
            blocksCompleted: Number(row.blocks_completed),
            payload: (row.payload as Record<string, unknown>) ?? {},
            trainingLoadLabel: (row.training_load_label as string | null) ?? null,
            rpe: row.rpe != null ? Number(row.rpe) : null,
            notes: (row.notes as string | null) ?? null,
            syncState: row.sync_state as TrainingCompletion["syncState"]
          };
        })
      };
    } catch {
      /* memory */
    }
  }
  return { backend: "memory", sessions: (mem.get(userId) ?? []).slice(0, limit) };
}

export function __resetTrainingCompletionMemory() {
  mem.clear();
}
