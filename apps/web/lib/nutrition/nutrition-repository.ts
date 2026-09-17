import { getPgPool } from "@/lib/db/pg-pool";
import { persistenceReady } from "@/lib/persistence/config";
import type { FoodRecord, MealSlotId, NutritionProfile } from "./types";
import type { PersistenceBackend } from "@/lib/sport-intelligence/identity-repository";

const profileMem = new Map<string, NutritionProfile>();
const logMem = new Map<string, FoodLogRow[]>();

export type FoodLogRow = {
  id: string;
  userId: string;
  foodId: string;
  food: FoodRecord;
  grams: number;
  slot: MealSlotId | null;
  dateISO: string;
  confirmedAtISO: string;
  source: "user_confirm";
};

export function emptyNutritionProfile(userId: string): NutritionProfile {
  return {
    userId,
    goal: null,
    dietPattern: null,
    allergies: [],
    intolerances: [],
    dislikes: [],
    religiousRestrictions: [],
    mealFrequency: null,
    countryLocale: "pt-PT",
    highRiskContext: false,
    declaredMedicalContext: false
  };
}

export type NutritionProfileStored = NutritionProfile & {
  bodyMassKg: number | null;
  heightCm: number | null;
  activityLevel: string | null;
  budget: string | null;
  prepTimeMin: number | null;
  shareWithCoach: boolean;
};

export function emptyNutritionProfileStored(userId: string): NutritionProfileStored {
  return {
    ...emptyNutritionProfile(userId),
    bodyMassKg: null,
    heightCm: null,
    activityLevel: null,
    budget: null,
    prepTimeMin: null,
    shareWithCoach: false
  };
}

const profileExtra = new Map<string, NutritionProfileStored>();

export async function readNutritionProfile(
  userId: string
): Promise<{ profile: NutritionProfileStored; backend: PersistenceBackend }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      const { rows } = await pool.query(
        `select user_id, goal, diet_pattern, allergies, intolerances, dislikes,
                religious_restrictions, meal_frequency, country_locale,
                high_risk_context, declared_medical_context, body_mass_kg, height_cm,
                activity_level, budget, prep_time_min, share_with_coach
         from public.nutrition_profiles where user_id = $1 limit 1`,
        [userId]
      );
      if (rows[0]) {
        const r = rows[0] as Record<string, unknown>;
        return {
          backend: "postgres",
          profile: {
            userId,
            goal: (r.goal as NutritionProfile["goal"]) ?? null,
            dietPattern: (r.diet_pattern as string | null) ?? null,
            allergies: (r.allergies as string[]) ?? [],
            intolerances: (r.intolerances as string[]) ?? [],
            dislikes: (r.dislikes as string[]) ?? [],
            religiousRestrictions: (r.religious_restrictions as string[]) ?? [],
            mealFrequency: r.meal_frequency != null ? Number(r.meal_frequency) : null,
            countryLocale: String(r.country_locale ?? "pt-PT"),
            highRiskContext: Boolean(r.high_risk_context),
            declaredMedicalContext: Boolean(r.declared_medical_context),
            bodyMassKg: r.body_mass_kg != null ? Number(r.body_mass_kg) : null,
            heightCm: r.height_cm != null ? Number(r.height_cm) : null,
            activityLevel: (r.activity_level as string | null) ?? null,
            budget: (r.budget as string | null) ?? null,
            prepTimeMin: r.prep_time_min != null ? Number(r.prep_time_min) : null,
            shareWithCoach: Boolean(r.share_with_coach)
          }
        };
      }
      return { profile: emptyNutritionProfileStored(userId), backend: "postgres" };
    } catch {
      /* memory */
    }
  }
  return {
    profile: profileExtra.get(userId) ?? emptyNutritionProfileStored(userId),
    backend: "memory"
  };
}

export async function upsertNutritionProfile(
  userId: string,
  patch: Partial<NutritionProfileStored>
): Promise<{ status: "ok"; profile: NutritionProfileStored; backend: PersistenceBackend }> {
  const current = await readNutritionProfile(userId);
  const next: NutritionProfileStored = { ...current.profile, ...patch, userId };

  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      await pool.query(
        `insert into public.nutrition_profiles (
           user_id, goal, diet_pattern, allergies, intolerances, dislikes,
           religious_restrictions, meal_frequency, country_locale,
           high_risk_context, declared_medical_context, body_mass_kg, height_cm,
           activity_level, budget, prep_time_min, share_with_coach, updated_at
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, now())
         on conflict (user_id) do update set
           goal = excluded.goal,
           diet_pattern = excluded.diet_pattern,
           allergies = excluded.allergies,
           intolerances = excluded.intolerances,
           dislikes = excluded.dislikes,
           religious_restrictions = excluded.religious_restrictions,
           meal_frequency = excluded.meal_frequency,
           country_locale = excluded.country_locale,
           high_risk_context = excluded.high_risk_context,
           declared_medical_context = excluded.declared_medical_context,
           body_mass_kg = excluded.body_mass_kg,
           height_cm = excluded.height_cm,
           activity_level = excluded.activity_level,
           budget = excluded.budget,
           prep_time_min = excluded.prep_time_min,
           share_with_coach = excluded.share_with_coach,
           updated_at = now()`,
        [
          userId,
          next.goal,
          next.dietPattern,
          next.allergies,
          next.intolerances,
          next.dislikes,
          next.religiousRestrictions,
          next.mealFrequency,
          next.countryLocale,
          next.highRiskContext,
          next.declaredMedicalContext,
          next.bodyMassKg,
          next.heightCm,
          next.activityLevel,
          next.budget,
          next.prepTimeMin,
          next.shareWithCoach
        ]
      );
      profileExtra.set(userId, next);
      profileMem.set(userId, next);
      return { status: "ok", profile: next, backend: "postgres" };
    } catch {
      /* memory */
    }
  }
  profileExtra.set(userId, next);
  profileMem.set(userId, next);
  return { status: "ok", profile: next, backend: "memory" };
}

export async function insertFoodLog(entry: FoodLogRow): Promise<{ backend: PersistenceBackend }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      await pool.query(
        `insert into public.nutrition_food_logs
          (id, user_id, food_id, food_snapshot, grams, slot, date_iso, confirmed_at, source)
         values ($1,$2,$3,$4::jsonb,$5,$6,$7::date,$8::timestamptz,'user_confirm')`,
        [
          entry.id,
          entry.userId,
          entry.foodId,
          JSON.stringify(entry.food),
          entry.grams,
          entry.slot,
          entry.dateISO,
          entry.confirmedAtISO
        ]
      );
      const list = logMem.get(entry.userId) ?? [];
      list.push(entry);
      logMem.set(entry.userId, list);
      return { backend: "postgres" };
    } catch {
      /* memory */
    }
  }
  const list = logMem.get(entry.userId) ?? [];
  list.push(entry);
  logMem.set(entry.userId, list);
  return { backend: "memory" };
}

export async function listFoodLogsPersisted(
  userId: string,
  dateISO?: string
): Promise<{ logs: FoodLogRow[]; backend: PersistenceBackend }> {
  const pool = getPgPool();
  if (pool && persistenceReady()) {
    try {
      const { rows } = dateISO
        ? await pool.query(
            `select id, user_id, food_id, food_snapshot, grams, slot, date_iso::text, confirmed_at::text, source
             from public.nutrition_food_logs where user_id = $1 and date_iso = $2::date
             order by confirmed_at asc`,
            [userId, dateISO]
          )
        : await pool.query(
            `select id, user_id, food_id, food_snapshot, grams, slot, date_iso::text, confirmed_at::text, source
             from public.nutrition_food_logs where user_id = $1
             order by confirmed_at desc limit 200`,
            [userId]
          );
      return {
        backend: "postgres",
        logs: rows.map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row.id),
            userId: String(row.user_id),
            foodId: String(row.food_id),
            food: row.food_snapshot as FoodRecord,
            grams: Number(row.grams),
            slot: (row.slot as MealSlotId | null) ?? null,
            dateISO: String(row.date_iso).slice(0, 10),
            confirmedAtISO: String(row.confirmed_at),
            source: "user_confirm" as const
          };
        })
      };
    } catch {
      /* memory */
    }
  }
  const list = logMem.get(userId) ?? [];
  return {
    backend: "memory",
    logs: dateISO ? list.filter((e) => e.dateISO === dateISO) : [...list]
  };
}

export function __resetNutritionPersistenceMemory() {
  profileMem.clear();
  profileExtra.clear();
  logMem.clear();
}
