import type { AthleteGoal, SportId } from "./sport-registry";

export type SportLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ELITE";

export type CompetitiveStatus = "RECREATIONAL" | "AMATEUR" | "COMPETITIVE" | "PROFESSIONAL";

export type TrainingLocationPref = "gym" | "home" | "outdoor" | "pool" | "court" | "mixed";

/** Sports identity — user chooses goals; never assumed. */
export type SportsIdentityProfile = {
  userId: string;
  primarySport: SportId | null;
  secondarySports: SportId[];
  sportLevel: SportLevel | null;
  trainingAgeYears: number | null;
  trainingDaysPerWeek: number | null;
  preferredTrainingDays: number[]; // 0=Sun .. 6=Sat
  sessionDurationMin: number | null;
  availableEquipment: string[];
  trainingLocation: TrainingLocationPref | null;
  competitiveStatus: CompetitiveStatus | null;
  competitionCalendar: Array<{ id: string; name: string; dateISO: string; sportId: SportId }>;
  primaryGoal: AthleteGoal | null;
  secondaryGoal: AthleteGoal | null;
  updatedAtISO: string | null;
};

export function emptySportsIdentity(userId: string): SportsIdentityProfile {
  return {
    userId,
    primarySport: null,
    secondarySports: [],
    sportLevel: null,
    trainingAgeYears: null,
    trainingDaysPerWeek: null,
    preferredTrainingDays: [],
    sessionDurationMin: null,
    availableEquipment: [],
    trainingLocation: null,
    competitiveStatus: null,
    competitionCalendar: [],
    primaryGoal: null,
    secondaryGoal: null,
    updatedAtISO: null
  };
}

export function profileCompleteness(profile: SportsIdentityProfile): {
  complete: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!profile.primarySport) missing.push("primary_sport");
  if (!profile.primaryGoal) missing.push("primary_goal");
  if (profile.trainingDaysPerWeek == null) missing.push("training_days_per_week");
  if (profile.sessionDurationMin == null) missing.push("session_duration");
  return { complete: missing.length === 0, missing };
}
