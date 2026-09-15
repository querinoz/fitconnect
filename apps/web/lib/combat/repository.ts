import { getPgPool } from "@/lib/db/pg-pool";
import { persistenceReady } from "@/lib/persistence/config";

export type CombatSessionRow = {
  id: string;
  user_id: string;
  discipline_id: string;
  session_mode: string;
  started_at: string;
  ended_at: string | null;
  rounds_completed: number;
  rpe: number | null;
  notes: string | null;
};

export type CombatProfileRow = {
  user_id: string;
  primary_discipline_id: string | null;
  disciplines: string[];
  rank: string | null;
  gym: string | null;
  coach: string | null;
  weight_class: string | null;
};

export async function listCombatSessions(userId: string): Promise<CombatSessionRow[]> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return [];
  try {
    const { rows } = await pool.query<CombatSessionRow>(
      `select id, user_id, discipline_id, session_mode, started_at::text, ended_at::text, rounds_completed, rpe, notes
       from public.combat_sessions
       where user_id = $1
       order by started_at desc
       limit 50`,
      [userId]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function insertCombatSession(input: {
  id: string;
  userId: string;
  disciplineId: string;
  sessionMode: string;
  startedAt: string;
  endedAt: string | null;
  roundsCompleted: number;
  rpe: number | null;
  notes: string | null;
}): Promise<{ status: "ok" | "unavailable"; duplicate?: boolean; row?: CombatSessionRow }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rows } = await pool.query<CombatSessionRow>(
      `insert into public.combat_sessions
        (id, user_id, discipline_id, session_mode, started_at, ended_at, rounds_completed, rpe, notes)
       values ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7, $8, $9)
       on conflict (id) do update set
         ended_at = excluded.ended_at,
         rounds_completed = excluded.rounds_completed,
         rpe = excluded.rpe,
         notes = excluded.notes
       returning id, user_id, discipline_id, session_mode, started_at::text, ended_at::text, rounds_completed, rpe, notes`,
      [
        input.id,
        input.userId,
        input.disciplineId,
        input.sessionMode,
        input.startedAt,
        input.endedAt,
        input.roundsCompleted,
        input.rpe,
        input.notes
      ]
    );
    return { status: "ok", row: rows[0], duplicate: false };
  } catch {
    return { status: "unavailable" };
  }
}

export async function readCombatProfile(userId: string): Promise<CombatProfileRow | null> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return null;
  try {
    const { rows } = await pool.query<CombatProfileRow>(
      `select user_id, primary_discipline_id, disciplines, rank, gym, coach, weight_class
       from public.athlete_combat_profiles
       where user_id = $1
       limit 1`,
      [userId]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function upsertCombatProfile(
  userId: string,
  input: {
    primaryDisciplineId?: string | null;
    disciplines?: string[];
    rank?: string | null;
    gym?: string | null;
    coach?: string | null;
    weightClass?: string | null;
  }
): Promise<{ status: "ok" | "unavailable"; row?: CombatProfileRow }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rows } = await pool.query<CombatProfileRow>(
      `insert into public.athlete_combat_profiles
        (user_id, primary_discipline_id, disciplines, rank, gym, coach, weight_class, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())
       on conflict (user_id) do update set
         primary_discipline_id = excluded.primary_discipline_id,
         disciplines = excluded.disciplines,
         rank = excluded.rank,
         gym = excluded.gym,
         coach = excluded.coach,
         weight_class = excluded.weight_class,
         updated_at = now()
       returning user_id, primary_discipline_id, disciplines, rank, gym, coach, weight_class`,
      [
        userId,
        input.primaryDisciplineId ?? null,
        input.disciplines ?? [],
        input.rank ?? null,
        input.gym ?? null,
        input.coach ?? null,
        input.weightClass ?? null
      ]
    );
    return { status: "ok", row: rows[0] };
  } catch {
    return { status: "unavailable" };
  }
}

export async function sessionOwnedBy(sessionId: string, userId: string): Promise<boolean> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return false;
  try {
    const { rows } = await pool.query<{ id: string }>(
      `select id from public.combat_sessions where id = $1 and user_id = $2 limit 1`,
      [sessionId, userId]
    );
    return Boolean(rows[0]);
  } catch {
    return false;
  }
}

export async function insertCombatEventForUser(
  userId: string,
  input: {
    id: string;
    sessionId: string;
    roundIndex: number | null;
    occurredAt: string;
    kind: string;
    payload: Record<string, unknown>;
    classification: string;
    source: string;
    confirmedBy: string | null;
  }
): Promise<{ status: "ok" | "unavailable" | "forbidden" }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rowCount } = await pool.query(
      `insert into public.combat_events
        (id, session_id, round_index, occurred_at, kind, payload, classification, source, confirmed_by)
       select $1, $2, $3, $4::timestamptz, $5, $6::jsonb, $7, $8, $9
       where exists (select 1 from public.combat_sessions s where s.id = $2 and s.user_id = $10)
       on conflict (id) do nothing`,
      [
        input.id,
        input.sessionId,
        input.roundIndex,
        input.occurredAt,
        input.kind,
        JSON.stringify(input.payload),
        input.classification,
        input.source,
        input.confirmedBy,
        userId
      ]
    );
    return rowCount ? { status: "ok" } : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function insertCombatMeasurementForUser(
  userId: string,
  input: {
    sessionId: string;
    roundIndex: number | null;
    metric: string;
    value: number | null;
    unit: string | null;
    measurementType: string;
    sensor: string;
    source: string;
    provider: string;
    confidence: string;
    sampledAt: string | null;
  }
): Promise<{ status: "ok" | "unavailable" | "forbidden" }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rowCount } = await pool.query(
      `insert into public.combat_measurements
        (session_id, round_index, metric, value, unit, measurement_type, sensor, source, provider, confidence, sampled_at)
       select $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz
       where exists (select 1 from public.combat_sessions s where s.id = $1 and s.user_id = $12)`,
      [
        input.sessionId,
        input.roundIndex,
        input.metric,
        input.value,
        input.unit,
        input.measurementType,
        input.sensor,
        input.source,
        input.provider,
        input.confidence,
        input.sampledAt,
        userId
      ]
    );
    return rowCount ? { status: "ok" } : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}

export type CombatCompetitionRow = {
  id: string;
  user_id: string;
  discipline_id: string;
  ruleset_id: string;
  ruleset_version: string;
  weight_class: string | null;
  age_class: string | null;
  event_name: string | null;
  outcome: string | null;
  method: string | null;
  score: string | null;
  source: string;
  notes: string | null;
  occurred_at: string;
};

export async function listCombatCompetitions(userId: string): Promise<CombatCompetitionRow[]> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return [];
  try {
    const { rows } = await pool.query<CombatCompetitionRow>(
      `select id::text, user_id, discipline_id, ruleset_id, ruleset_version, weight_class, age_class,
              event_name, outcome, method, score, source, notes, occurred_at::text
       from public.combat_competitions
       where user_id = $1
       order by occurred_at desc
       limit 50`,
      [userId]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function insertCombatCompetition(
  userId: string,
  input: {
    disciplineId: string;
    rulesetId: string;
    rulesetVersion: string;
    weightClass: string | null;
    ageClass: string | null;
    eventName: string | null;
    outcome: string | null;
    method: string | null;
    score: string | null;
    source: "official" | "athlete" | "coach";
    notes: string | null;
    occurredAt: string;
  }
): Promise<{ status: "ok" | "unavailable"; row?: CombatCompetitionRow }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rows } = await pool.query<CombatCompetitionRow>(
      `insert into public.combat_competitions
        (user_id, discipline_id, ruleset_id, ruleset_version, weight_class, age_class, event_name,
         outcome, method, score, source, notes, occurred_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::timestamptz)
       returning id::text, user_id, discipline_id, ruleset_id, ruleset_version, weight_class, age_class,
                 event_name, outcome, method, score, source, notes, occurred_at::text`,
      [
        userId,
        input.disciplineId,
        input.rulesetId,
        input.rulesetVersion,
        input.weightClass,
        input.ageClass,
        input.eventName,
        input.outcome,
        input.method,
        input.score,
        input.source,
        input.notes,
        input.occurredAt
      ]
    );
    return { status: "ok", row: rows[0] };
  } catch {
    return { status: "unavailable" };
  }
}

export type CombatCalibrationRow = {
  user_id: string;
  device_id: string;
  sensor: string;
  dominant_side: string | null;
  placement: string | null;
  sampling_hz: number | null;
  orientation: string | null;
  calibrated_at: string;
};

export async function listCombatCalibrations(userId: string): Promise<CombatCalibrationRow[]> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return [];
  try {
    const { rows } = await pool.query<CombatCalibrationRow>(
      `select user_id, device_id, sensor, dominant_side, placement, sampling_hz, orientation, calibrated_at::text
       from public.combat_calibrations
       where user_id = $1`,
      [userId]
    );
    return rows;
  } catch {
    return [];
  }
}

export async function upsertCombatCalibration(
  userId: string,
  input: {
    deviceId: string;
    sensor: string;
    dominantSide: string | null;
    placement: string | null;
    samplingHz: number | null;
    orientation: string | null;
  }
): Promise<{ status: "ok" | "unavailable"; row?: CombatCalibrationRow }> {
  const pool = getPgPool();
  if (!pool || !persistenceReady()) return { status: "unavailable" };
  try {
    const { rows } = await pool.query<CombatCalibrationRow>(
      `insert into public.combat_calibrations
        (user_id, device_id, sensor, dominant_side, placement, sampling_hz, orientation, calibrated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())
       on conflict (user_id, device_id, sensor) do update set
         dominant_side = excluded.dominant_side,
         placement = excluded.placement,
         sampling_hz = excluded.sampling_hz,
         orientation = excluded.orientation,
         calibrated_at = now()
       returning user_id, device_id, sensor, dominant_side, placement, sampling_hz, orientation, calibrated_at::text`,
      [
        userId,
        input.deviceId,
        input.sensor,
        input.dominantSide,
        input.placement,
        input.samplingHz,
        input.orientation
      ]
    );
    return { status: "ok", row: rows[0] };
  } catch {
    return { status: "unavailable" };
  }
}
