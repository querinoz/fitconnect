import { getPgPool } from "@/lib/db/pg-pool";
import { persistenceReady } from "@/lib/persistence/config";
import type { SportsIdentityProfile } from "./sports-identity";
import { emptySportsIdentity } from "./sports-identity";
import type { AthleteGoal, SportId } from "./sport-registry";
import { SPORT_REGISTRY } from "./sport-registry";

export type PersistenceBackend = "postgres" | "memory";

type Stored = SportsIdentityProfile & { _backend?: PersistenceBackend };

const memory = new Map<string, SportsIdentityProfile>();

function isSportId(v: unknown): v is SportId {
  return typeof v === "string" && v in SPORT_REGISTRY;
}

export function rowToProfile(userId: string, row: Record<string, unknown>): SportsIdentityProfile {
  const base = emptySportsIdentity(userId);
  return {
    ...base,
    primarySport: isSportId(row.primary_sport) ? row.primary_sport : null,
    secondarySports: Array.isArray(row.secondary_sports)
      ? (row.secondary_sports as unknown[]).filter(isSportId)
      : [],
    sportLevel: (row.sport_level as SportsIdentityProfile["sportLevel"]) ?? null,
    trainingAgeYears:
      row.training_age_years != null && Number.isFinite(Number(row.training_age_years))
        ? Number(row.training_age_years)
        : null,
    trainingDaysPerWeek:
      row.training_days_per_week != null && Number.isFinite(Number(row.training_days_per_week))
        ? Number(row.training_days_per_week)
        : null,
    preferredTrainingDays: Array.isArray(row.preferred_training_days)
      ? (row.preferred_training_days as number[]).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
      : [],
    sessionDurationMin:
      row.session_duration_min != null && Number.isFinite(Number(row.session_duration_min))
        ? Number(row.session_duration_min)
        : null,
    availableEquipment: Array.isArray(row.available_equipment)
      ? (row.available_equipment as string[])
      : [],
    trainingLocation: (row.training_location as SportsIdentityProfile["trainingLocation"]) ?? null,
    competitiveStatus: (row.competitive_status as SportsIdentityProfile["competitiveStatus"]) ?? null,
    competitionCalendar: Array.isArray(row.competition_calendar)
      ? (row.competition_calendar as SportsIdentityProfile["competitionCalendar"])
      : [],
    primaryGoal: (row.primary_goal as AthleteGoal | null) ?? null,
    secondaryGoal: (row.secondary_goal as AthleteGoal | null) ?? null,
    updatedAtISO: row.updated_at != null ? String(row.updated_at) : null
  };
}

export async function readSportsIdentity(
  userId: string
): Promise<{ profile: SportsIdentityProfile; backend: PersistenceBackend }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      const { rows } = await pool.query(
        `select user_id, primary_sport, secondary_sports, sport_level, training_age_years,
                training_days_per_week, preferred_training_days, session_duration_min,
                available_equipment, training_location, competitive_status, competition_calendar,
                primary_goal, secondary_goal, updated_at::text
         from public.athlete_sports_profiles
         where user_id = $1
         limit 1`,
        [userId]
      );
      if (rows[0]) {
        return { profile: rowToProfile(userId, rows[0] as Record<string, unknown>), backend: "postgres" };
      }
      return { profile: emptySportsIdentity(userId), backend: "postgres" };
    } catch {
      // fall through to memory
    }
  }
  const mem = memory.get(userId) ?? emptySportsIdentity(userId);
  return { profile: mem, backend: "memory" };
}

export async function upsertSportsIdentity(
  userId: string,
  patch: Partial<SportsIdentityProfile>
): Promise<{ status: "ok" | "unavailable"; profile: SportsIdentityProfile; backend: PersistenceBackend }> {
  const current = await readSportsIdentity(userId);
  const next: SportsIdentityProfile = {
    ...current.profile,
    ...patch,
    userId,
    secondarySports: patch.secondarySports ?? current.profile.secondarySports,
    preferredTrainingDays: patch.preferredTrainingDays ?? current.profile.preferredTrainingDays,
    availableEquipment: patch.availableEquipment ?? current.profile.availableEquipment,
    competitionCalendar: patch.competitionCalendar ?? current.profile.competitionCalendar,
    updatedAtISO: new Date().toISOString()
  };

  if (next.primarySport && !isSportId(next.primarySport)) {
    next.primarySport = null;
  }
  next.secondarySports = next.secondarySports.filter(isSportId);

  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      await pool.query(
        `insert into public.athlete_sports_profiles (
           user_id, primary_sport, secondary_sports, sport_level, training_age_years,
           training_days_per_week, preferred_training_days, session_duration_min,
           available_equipment, training_location, competitive_status, competition_calendar,
           primary_goal, secondary_goal, updated_at
         ) values (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14, now()
         )
         on conflict (user_id) do update set
           primary_sport = excluded.primary_sport,
           secondary_sports = excluded.secondary_sports,
           sport_level = excluded.sport_level,
           training_age_years = excluded.training_age_years,
           training_days_per_week = excluded.training_days_per_week,
           preferred_training_days = excluded.preferred_training_days,
           session_duration_min = excluded.session_duration_min,
           available_equipment = excluded.available_equipment,
           training_location = excluded.training_location,
           competitive_status = excluded.competitive_status,
           competition_calendar = excluded.competition_calendar,
           primary_goal = excluded.primary_goal,
           secondary_goal = excluded.secondary_goal,
           updated_at = now()`,
        [
          userId,
          next.primarySport,
          next.secondarySports,
          next.sportLevel,
          next.trainingAgeYears,
          next.trainingDaysPerWeek,
          next.preferredTrainingDays,
          next.sessionDurationMin,
          next.availableEquipment,
          next.trainingLocation,
          next.competitiveStatus,
          JSON.stringify(next.competitionCalendar),
          next.primaryGoal,
          next.secondaryGoal
        ]
      );
      memory.set(userId, next);
      return { status: "ok", profile: next, backend: "postgres" };
    } catch {
      // fall through
    }
  }

  memory.set(userId, next);
  return { status: "ok", profile: next, backend: "memory" };
}

/** Test helper */
export function __resetSportsIdentityMemory() {
  memory.clear();
}

export type { Stored };
