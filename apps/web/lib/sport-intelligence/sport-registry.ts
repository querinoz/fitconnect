/**
 * FitConnect Sport Domain Registry — configurable, extensible.
 * Rules live here as data — not scattered in UI.
 */

export type SportId =
  | "STRENGTH"
  | "BODYBUILDING"
  | "POWERLIFTING"
  | "RUNNING"
  | "TRAIL_RUNNING"
  | "CYCLING"
  | "MOUNTAIN_BIKING"
  | "SWIMMING"
  | "TRIATHLON"
  | "FOOTBALL"
  | "BASKETBALL"
  | "TENNIS"
  | "PADEL"
  | "VOLLEYBALL"
  | "ROWING"
  | "HYROX"
  | "CROSSFIT"
  | "HIIT"
  | "MARTIAL_ARTS"
  | "BOXING"
  | "MMA"
  | "WRESTLING"
  | "CLIMBING"
  | "HIKING"
  | "SKIING"
  | "GENERAL_FITNESS";

export type AthleteGoal =
  | "MUSCLE_GAIN"
  | "FAT_LOSS"
  | "BODY_RECOMPOSITION"
  | "MAINTENANCE"
  | "STRENGTH"
  | "HYPERTROPHY"
  | "POWER"
  | "SPEED"
  | "ENDURANCE"
  | "AEROBIC_CAPACITY"
  | "PERFORMANCE"
  | "ENERGY"
  | "RECOVERY"
  | "GENERAL_FITNESS";

export type EnergySystem = "alactic" | "glycolytic" | "aerobic" | "mixed";

export type SessionTypeId = string;

export type SportMetricId =
  | "load_kg"
  | "reps"
  | "rir"
  | "rpe"
  | "pace"
  | "distance_m"
  | "duration_s"
  | "hr_bpm"
  | "power_w"
  | "cadence"
  | "rounds"
  | "technique";

export type SportProfile = {
  id: SportId;
  label: string;
  movementPatterns: string[];
  energySystems: EnergySystem[];
  primaryMetrics: SportMetricId[];
  secondaryMetrics: SportMetricId[];
  sessionTypes: SessionTypeId[];
  recoveryPatterns: string[];
  trainingBlocks: string[];
  commonEquipment: string[];
  exerciseCategories: string[];
  nutritionProfileKey: string;
  hydrationProfileKey: string;
  competitionPhases: string[];
  progressionStrategy: string;
  safetyConstraints: string[];
  /** Maps legacy TrainSport strings used by catalog */
  legacyTrainSports: string[];
};

const STRENGTH_SESSIONS = [
  "warmup",
  "strength",
  "hypertrophy",
  "power",
  "technique",
  "conditioning",
  "deload"
];

const RUNNING_SESSIONS = [
  "recovery",
  "easy",
  "long",
  "tempo",
  "threshold",
  "interval",
  "hill",
  "sprint",
  "strides",
  "race_simulation"
];

const CYCLING_SESSIONS = [
  "recovery",
  "endurance",
  "tempo",
  "sweet_spot",
  "threshold",
  "vo2",
  "sprint",
  "skills",
  "long_ride"
];

const SWIMMING_SESSIONS = [
  "technique",
  "aerobic",
  "threshold",
  "interval",
  "sprint",
  "drills",
  "open_water"
];

const FOOTBALL_SESSIONS = [
  "technical",
  "tactical",
  "acceleration",
  "deceleration",
  "change_of_direction",
  "small_sided",
  "conditioning",
  "strength",
  "match_day",
  "recovery"
];

const BASKETBALL_SESSIONS = [
  "skill",
  "shooting",
  "jump",
  "acceleration",
  "deceleration",
  "agility",
  "conditioning",
  "strength",
  "recovery"
];

const RACKET_SESSIONS = [
  "skill",
  "footwork",
  "change_of_direction",
  "repeated_sprint",
  "serve",
  "technical",
  "strength",
  "conditioning",
  "match_simulation"
];

const COMBAT_SESSIONS = [
  "technique",
  "pads",
  "bag",
  "grappling",
  "sparring",
  "conditioning",
  "strength",
  "mobility",
  "recovery"
];

function base(
  partial: Omit<SportProfile, "safetyConstraints"> & { safetyConstraints?: string[] }
): SportProfile {
  return {
    safetyConstraints: [
      "No medical diagnosis",
      "No fabricated biometrics",
      ...(partial.safetyConstraints ?? [])
    ],
    ...partial
  };
}

/** Registry — add sports by appending profiles; engines consume SportId only. */
export const SPORT_REGISTRY: Record<SportId, SportProfile> = {
  STRENGTH: base({
    id: "STRENGTH",
    label: "Strength",
    movementPatterns: ["squat", "hinge", "push", "pull", "carry"],
    energySystems: ["alactic", "glycolytic"],
    primaryMetrics: ["load_kg", "reps", "rir", "rpe"],
    secondaryMetrics: ["duration_s"],
    sessionTypes: STRENGTH_SESSIONS,
    recoveryPatterns: ["48h_muscle_group", "deload_week"],
    trainingBlocks: ["WARMUP", "MAIN", "ACCESSORY", "COOLDOWN"],
    commonEquipment: ["barbell", "dumbbell", "rack"],
    exerciseCategories: ["compound", "isolation"],
    nutritionProfileKey: "strength",
    hydrationProfileKey: "standard",
    competitionPhases: ["off_season", "peaking"],
    progressionStrategy: "DOUBLE_PROGRESSION",
    legacyTrainSports: ["strength", "hypertrophy"],
    safetyConstraints: ["Warm-up sets excluded from progression baseline by default"]
  }),
  BODYBUILDING: base({
    id: "BODYBUILDING",
    label: "Bodybuilding",
    movementPatterns: ["push", "pull", "squat", "hinge", "isolation"],
    energySystems: ["glycolytic"],
    primaryMetrics: ["load_kg", "reps", "rir"],
    secondaryMetrics: ["rpe", "duration_s"],
    sessionTypes: STRENGTH_SESSIONS,
    recoveryPatterns: ["body_part_split"],
    trainingBlocks: ["WARMUP", "MAIN", "ACCESSORY", "COOLDOWN"],
    commonEquipment: ["dumbbell", "cable", "machine"],
    exerciseCategories: ["hypertrophy"],
    nutritionProfileKey: "hypertrophy",
    hydrationProfileKey: "standard",
    competitionPhases: ["bulk", "cut_supervised"],
    progressionStrategy: "REP_BASED",
    legacyTrainSports: ["hypertrophy"],
    safetyConstraints: ["No unsupervised extreme deficit"]
  }),
  POWERLIFTING: base({
    id: "POWERLIFTING",
    label: "Powerlifting",
    movementPatterns: ["squat", "bench", "deadlift"],
    energySystems: ["alactic"],
    primaryMetrics: ["load_kg", "reps", "rpe"],
    secondaryMetrics: ["rir"],
    sessionTypes: ["strength", "technique", "deload", "peak"],
    recoveryPatterns: ["cns_heavy"],
    trainingBlocks: ["WARMUP", "MAIN", "ACCESSORY"],
    commonEquipment: ["barbell", "belt", "rack"],
    exerciseCategories: ["competition_lift", "accessory"],
    nutritionProfileKey: "strength",
    hydrationProfileKey: "standard",
    competitionPhases: ["preparation", "peak", "meet"],
    progressionStrategy: "LINEAR",
    legacyTrainSports: ["strength"]
  }),
  RUNNING: base({
    id: "RUNNING",
    label: "Running",
    movementPatterns: ["run_gait"],
    energySystems: ["aerobic", "glycolytic"],
    primaryMetrics: ["duration_s", "distance_m", "pace"],
    secondaryMetrics: ["hr_bpm", "rpe"],
    sessionTypes: RUNNING_SESSIONS,
    recoveryPatterns: ["easy_after_hard", "cutback_week"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["shoes", "watch"],
    exerciseCategories: ["continuous", "interval"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "build", "taper", "race"],
    progressionStrategy: "PACE_BASED",
    legacyTrainSports: ["running", "endurance"]
  }),
  TRAIL_RUNNING: base({
    id: "TRAIL_RUNNING",
    label: "Trail running",
    movementPatterns: ["run_gait", "hike"],
    energySystems: ["aerobic", "mixed"],
    primaryMetrics: ["duration_s", "distance_m", "pace"],
    secondaryMetrics: ["hr_bpm", "rpe"],
    sessionTypes: [...RUNNING_SESSIONS, "vertical"],
    recoveryPatterns: ["easy_after_long"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["shoes", "poles"],
    exerciseCategories: ["trail", "climb"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "build", "race"],
    progressionStrategy: "TIME_BASED",
    legacyTrainSports: ["running", "endurance"]
  }),
  CYCLING: base({
    id: "CYCLING",
    label: "Cycling",
    movementPatterns: ["pedal"],
    energySystems: ["aerobic", "glycolytic"],
    primaryMetrics: ["duration_s", "distance_m", "power_w"],
    secondaryMetrics: ["cadence", "hr_bpm", "rpe"],
    sessionTypes: CYCLING_SESSIONS,
    recoveryPatterns: ["easy_spin"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["bike", "trainer", "power_meter"],
    exerciseCategories: ["endurance", "interval"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "build", "race"],
    progressionStrategy: "POWER_BASED",
    legacyTrainSports: ["cycling", "endurance"]
  }),
  MOUNTAIN_BIKING: base({
    id: "MOUNTAIN_BIKING",
    label: "Mountain biking",
    movementPatterns: ["pedal", "skills"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "distance_m", "rpe"],
    secondaryMetrics: ["hr_bpm", "power_w"],
    sessionTypes: [...CYCLING_SESSIONS, "skills"],
    recoveryPatterns: ["easy_spin"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["mtb", "helmet"],
    exerciseCategories: ["trail", "skills"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "race"],
    progressionStrategy: "TIME_BASED",
    legacyTrainSports: ["cycling"]
  }),
  SWIMMING: base({
    id: "SWIMMING",
    label: "Swimming",
    movementPatterns: ["swim_stroke"],
    energySystems: ["aerobic", "glycolytic"],
    primaryMetrics: ["distance_m", "duration_s", "pace"],
    secondaryMetrics: ["rpe"],
    sessionTypes: SWIMMING_SESSIONS,
    recoveryPatterns: ["technique_easy"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["pool", "pull_buoy"],
    exerciseCategories: ["stroke", "drill", "set"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "standard",
    competitionPhases: ["base", "taper", "meet"],
    progressionStrategy: "DISTANCE_BASED",
    legacyTrainSports: ["endurance"]
  }),
  TRIATHLON: base({
    id: "TRIATHLON",
    label: "Triathlon",
    movementPatterns: ["swim_stroke", "pedal", "run_gait"],
    energySystems: ["aerobic", "mixed"],
    primaryMetrics: ["duration_s", "distance_m", "pace"],
    secondaryMetrics: ["power_w", "hr_bpm"],
    sessionTypes: ["brick", "swim", "bike", "run", "recovery"],
    recoveryPatterns: ["discipline_rotation"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["bike", "wetsuit", "shoes"],
    exerciseCategories: ["multisport"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "build", "taper", "race"],
    progressionStrategy: "TIME_BASED",
    legacyTrainSports: ["endurance", "running", "cycling"],
    safetyConstraints: ["Avoid double-counting same session across disciplines"]
  }),
  FOOTBALL: base({
    id: "FOOTBALL",
    label: "Football",
    movementPatterns: ["sprint", "cod", "kick"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: ["distance_m", "hr_bpm"],
    sessionTypes: FOOTBALL_SESSIONS,
    recoveryPatterns: ["match_plus_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["ball", "cones"],
    exerciseCategories: ["technical", "tactical", "physical"],
    nutritionProfileKey: "team_sport",
    hydrationProfileKey: "team_sport",
    competitionPhases: ["pre_season", "in_season", "match_week"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport", "conditioning"]
  }),
  BASKETBALL: base({
    id: "BASKETBALL",
    label: "Basketball",
    movementPatterns: ["jump", "sprint", "cod"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: ["distance_m"],
    sessionTypes: BASKETBALL_SESSIONS,
    recoveryPatterns: ["game_plus_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["ball", "court"],
    exerciseCategories: ["skill", "athletic"],
    nutritionProfileKey: "team_sport",
    hydrationProfileKey: "team_sport",
    competitionPhases: ["pre_season", "in_season"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport", "conditioning"]
  }),
  TENNIS: base({
    id: "TENNIS",
    label: "Tennis",
    movementPatterns: ["cod", "serve", "stroke"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe"],
    secondaryMetrics: ["rounds"],
    sessionTypes: RACKET_SESSIONS,
    recoveryPatterns: ["match_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["racket", "balls"],
    exerciseCategories: ["technical", "athletic"],
    nutritionProfileKey: "racket",
    hydrationProfileKey: "team_sport",
    competitionPhases: ["training", "tournament"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport"]
  }),
  PADEL: base({
    id: "PADEL",
    label: "Padel",
    movementPatterns: ["cod", "volley"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe"],
    secondaryMetrics: ["rounds"],
    sessionTypes: RACKET_SESSIONS,
    recoveryPatterns: ["match_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["padel_racket", "balls"],
    exerciseCategories: ["technical", "athletic"],
    nutritionProfileKey: "racket",
    hydrationProfileKey: "team_sport",
    competitionPhases: ["training", "tournament"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport"]
  }),
  VOLLEYBALL: base({
    id: "VOLLEYBALL",
    label: "Volleyball",
    movementPatterns: ["jump", "dig", "spike"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: [],
    sessionTypes: ["skill", "conditioning", "strength", "match", "recovery"],
    recoveryPatterns: ["match_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["ball", "net"],
    exerciseCategories: ["skill", "athletic"],
    nutritionProfileKey: "team_sport",
    hydrationProfileKey: "team_sport",
    competitionPhases: ["season"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport"]
  }),
  ROWING: base({
    id: "ROWING",
    label: "Rowing",
    movementPatterns: ["row_stroke"],
    energySystems: ["aerobic", "glycolytic"],
    primaryMetrics: ["duration_s", "distance_m", "power_w"],
    secondaryMetrics: ["pace", "rpe"],
    sessionTypes: ["endurance", "tempo", "interval", "technique", "recovery"],
    recoveryPatterns: ["easy_after_hard"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["erg", "boat"],
    exerciseCategories: ["continuous", "interval"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["base", "race"],
    progressionStrategy: "POWER_BASED",
    legacyTrainSports: ["endurance", "conditioning"]
  }),
  HYROX: base({
    id: "HYROX",
    label: "HYROX",
    movementPatterns: ["run_gait", "carry", "push", "pull"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: ["distance_m", "load_kg"],
    sessionTypes: ["engine", "station", "race_simulation", "strength", "recovery"],
    recoveryPatterns: ["cutback"],
    trainingBlocks: ["WARMUP", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["sled", "wall_ball", "rower"],
    exerciseCategories: ["hybrid"],
    nutritionProfileKey: "hybrid",
    hydrationProfileKey: "endurance",
    competitionPhases: ["prep", "race"],
    progressionStrategy: "TIME_BASED",
    legacyTrainSports: ["hiit", "conditioning", "endurance"]
  }),
  CROSSFIT: base({
    id: "CROSSFIT",
    label: "CrossFit",
    movementPatterns: ["squat", "hinge", "push", "pull", "gymnastic"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rounds", "rpe", "load_kg"],
    secondaryMetrics: ["reps"],
    sessionTypes: ["strength", "metcon", "skill", "recovery"],
    recoveryPatterns: ["deload"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["barbell", "box", "rower"],
    exerciseCategories: ["wod", "strength"],
    nutritionProfileKey: "hybrid",
    hydrationProfileKey: "standard",
    competitionPhases: ["open", "games"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["hiit", "conditioning", "strength"]
  }),
  HIIT: base({
    id: "HIIT",
    label: "HIIT",
    movementPatterns: ["mixed"],
    energySystems: ["glycolytic", "alactic"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: ["hr_bpm"],
    sessionTypes: ["interval", "circuit", "recovery"],
    recoveryPatterns: ["easy_day"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["bodyweight", "kettlebell"],
    exerciseCategories: ["interval"],
    nutritionProfileKey: "hybrid",
    hydrationProfileKey: "standard",
    competitionPhases: [],
    progressionStrategy: "TIME_BASED",
    legacyTrainSports: ["hiit", "conditioning"]
  }),
  MARTIAL_ARTS: base({
    id: "MARTIAL_ARTS",
    label: "Martial arts",
    movementPatterns: ["strike", "grapple", "footwork"],
    energySystems: ["mixed"],
    primaryMetrics: ["rounds", "duration_s", "rpe"],
    secondaryMetrics: ["technique"],
    sessionTypes: COMBAT_SESSIONS,
    recoveryPatterns: ["technique_after_spar"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["gloves", "pads", "mats"],
    exerciseCategories: ["technique", "conditioning"],
    nutritionProfileKey: "combat",
    hydrationProfileKey: "combat",
    competitionPhases: ["training", "camp", "competition"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["martial_arts"],
    safetyConstraints: [
      "Never automate dehydration or acute weight cutting",
      "Never prescribe diuretics or unsafe fluid restriction"
    ]
  }),
  BOXING: base({
    id: "BOXING",
    label: "Boxing",
    movementPatterns: ["strike", "footwork"],
    energySystems: ["mixed"],
    primaryMetrics: ["rounds", "duration_s", "rpe"],
    secondaryMetrics: ["technique"],
    sessionTypes: COMBAT_SESSIONS,
    recoveryPatterns: ["technique_after_spar"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["gloves", "bag", "pads"],
    exerciseCategories: ["pads", "bag", "sparring"],
    nutritionProfileKey: "combat",
    hydrationProfileKey: "combat",
    competitionPhases: ["training", "camp", "fight"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["martial_arts"],
    safetyConstraints: ["Never automate dehydration or acute weight cutting"]
  }),
  MMA: base({
    id: "MMA",
    label: "MMA",
    movementPatterns: ["strike", "grapple"],
    energySystems: ["mixed"],
    primaryMetrics: ["rounds", "duration_s", "rpe"],
    secondaryMetrics: ["technique"],
    sessionTypes: COMBAT_SESSIONS,
    recoveryPatterns: ["camp_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "CONDITIONING", "COOLDOWN"],
    commonEquipment: ["gloves", "mats"],
    exerciseCategories: ["striking", "grappling"],
    nutritionProfileKey: "combat",
    hydrationProfileKey: "combat",
    competitionPhases: ["training", "camp", "fight"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["martial_arts"],
    safetyConstraints: ["Never automate dehydration or acute weight cutting"]
  }),
  WRESTLING: base({
    id: "WRESTLING",
    label: "Wrestling",
    movementPatterns: ["grapple"],
    energySystems: ["glycolytic", "mixed"],
    primaryMetrics: ["rounds", "duration_s", "rpe"],
    secondaryMetrics: ["technique"],
    sessionTypes: ["technique", "live", "conditioning", "strength", "recovery"],
    recoveryPatterns: ["camp_recovery"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["mats"],
    exerciseCategories: ["technique", "live"],
    nutritionProfileKey: "combat",
    hydrationProfileKey: "combat",
    competitionPhases: ["training", "camp", "meet"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["martial_arts"],
    safetyConstraints: ["Never automate dehydration or acute weight cutting"]
  }),
  CLIMBING: base({
    id: "CLIMBING",
    label: "Climbing",
    movementPatterns: ["pull", "grip"],
    energySystems: ["alactic", "aerobic"],
    primaryMetrics: ["duration_s", "rpe", "rounds"],
    secondaryMetrics: ["technique"],
    sessionTypes: ["strength", "technique", "endurance", "recovery"],
    recoveryPatterns: ["finger_rest"],
    trainingBlocks: ["WARMUP", "SKILL", "MAIN", "COOLDOWN"],
    commonEquipment: ["shoes", "board"],
    exerciseCategories: ["bouldering", "route"],
    nutritionProfileKey: "strength",
    hydrationProfileKey: "standard",
    competitionPhases: ["training", "comp"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport", "strength"]
  }),
  HIKING: base({
    id: "HIKING",
    label: "Hiking",
    movementPatterns: ["hike"],
    energySystems: ["aerobic"],
    primaryMetrics: ["duration_s", "distance_m"],
    secondaryMetrics: ["rpe"],
    sessionTypes: ["easy", "long", "vertical", "recovery"],
    recoveryPatterns: ["easy_after_long"],
    trainingBlocks: ["MAIN"],
    commonEquipment: ["boots", "pack"],
    exerciseCategories: ["continuous"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: [],
    progressionStrategy: "DISTANCE_BASED",
    legacyTrainSports: ["endurance"]
  }),
  SKIING: base({
    id: "SKIING",
    label: "Skiing",
    movementPatterns: ["ski"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe"],
    secondaryMetrics: ["distance_m"],
    sessionTypes: ["technique", "endurance", "strength", "recovery"],
    recoveryPatterns: ["easy_day"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["skis"],
    exerciseCategories: ["on_snow", "dryland"],
    nutritionProfileKey: "endurance",
    hydrationProfileKey: "endurance",
    competitionPhases: ["season"],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["sport", "endurance"]
  }),
  GENERAL_FITNESS: base({
    id: "GENERAL_FITNESS",
    label: "General fitness",
    movementPatterns: ["mixed"],
    energySystems: ["mixed"],
    primaryMetrics: ["duration_s", "rpe"],
    secondaryMetrics: ["load_kg", "reps"],
    sessionTypes: ["strength", "conditioning", "mobility", "recovery"],
    recoveryPatterns: ["rest_day"],
    trainingBlocks: ["WARMUP", "MAIN", "COOLDOWN"],
    commonEquipment: ["bodyweight", "dumbbell"],
    exerciseCategories: ["general"],
    nutritionProfileKey: "general",
    hydrationProfileKey: "standard",
    competitionPhases: [],
    progressionStrategy: "USER_DEFINED",
    legacyTrainSports: ["conditioning", "mobility", "recovery", "sport"]
  })
};

export function listSports(): SportProfile[] {
  return Object.values(SPORT_REGISTRY);
}

export function getSport(id: SportId): SportProfile {
  return SPORT_REGISTRY[id];
}

export function sportFromLegacyTrainSport(legacy: string): SportId {
  const hit = listSports().find((s) => s.legacyTrainSports.includes(legacy));
  return hit?.id ?? "GENERAL_FITNESS";
}

export function isValidSessionType(sportId: SportId, sessionType: string): boolean {
  return getSport(sportId).sessionTypes.includes(sessionType);
}
