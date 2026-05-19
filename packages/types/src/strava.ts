/** All Strava `sport_type` values (API v3, 2026). */
export type StravaSportType =
  | "AlpineSki"
  | "BackcountrySki"
  | "Badminton"
  | "Basketball"
  | "Canoeing"
  | "Cricket"
  | "Crossfit"
  | "Dance"
  | "EBikeRide"
  | "Elliptical"
  | "EMountainBikeRide"
  | "Golf"
  | "GravelRide"
  | "Handcycle"
  | "HighIntensityIntervalTraining"
  | "Hike"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "MountainBikeRide"
  | "NordicSki"
  | "Padel"
  | "PhysicalTherapy"
  | "Pickleball"
  | "Pilates"
  | "Racquetball"
  | "Ride"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Run"
  | "Sail"
  | "Skateboard"
  | "Snowboard"
  | "Snowshoe"
  | "Soccer"
  | "Squash"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "Swim"
  | "TableTennis"
  | "Tennis"
  | "TrailRun"
  | "Velomobile"
  | "VirtualRide"
  | "VirtualRow"
  | "VirtualRun"
  | "Volleyball"
  | "Walk"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

/** Legacy `type` field — kept for backward compatibility with older activities. */
export type StravaLegacyActivityType =
  | StravaSportType
  | "CrossCountrySkiing"
  | "AlpineSkiing"
  | "BackcountrySkiing"
  | "NordicSkiing"
  | "IceSkating"
  | "InlineSkating"
  | "EBikeRide"
  | "EMountainBikeRide";

export const STRAVA_SPORT_TYPES = [
  "AlpineSki",
  "BackcountrySki",
  "Badminton",
  "Basketball",
  "Canoeing",
  "Cricket",
  "Crossfit",
  "Dance",
  "EBikeRide",
  "Elliptical",
  "EMountainBikeRide",
  "Golf",
  "GravelRide",
  "Handcycle",
  "HighIntensityIntervalTraining",
  "Hike",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "MountainBikeRide",
  "NordicSki",
  "Padel",
  "PhysicalTherapy",
  "Pickleball",
  "Pilates",
  "Racquetball",
  "Ride",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Run",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "Soccer",
  "Squash",
  "StairStepper",
  "StandUpPaddling",
  "Surfing",
  "Swim",
  "TableTennis",
  "Tennis",
  "TrailRun",
  "Velomobile",
  "VirtualRide",
  "VirtualRow",
  "VirtualRun",
  "Volleyball",
  "Walk",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga"
] as const satisfies readonly StravaSportType[];

export type SportCategory =
  | "Foot"
  | "Cycle"
  | "Water"
  | "Winter"
  | "Strength"
  | "Court"
  | "Other";

export type SportTypeMeta = {
  label: string;
  labelPt: string;
  icon: string;
  category: SportCategory;
};

export const SportTypeConfig: Record<StravaSportType, SportTypeMeta> = {
  Run: { label: "Run", labelPt: "Corrida", icon: "🏃", category: "Foot" },
  TrailRun: { label: "Trail Run", labelPt: "Trail", icon: "🏃‍♂️", category: "Foot" },
  Walk: { label: "Walk", labelPt: "Caminhada", icon: "🚶", category: "Foot" },
  Hike: { label: "Hike", labelPt: "Trilha", icon: "🥾", category: "Foot" },
  VirtualRun: { label: "Virtual Run", labelPt: "Corrida Virtual", icon: "🏃", category: "Foot" },
  Ride: { label: "Ride", labelPt: "Ciclismo", icon: "🚴", category: "Cycle" },
  MountainBikeRide: { label: "MTB", labelPt: "MTB", icon: "⛰️", category: "Cycle" },
  GravelRide: { label: "Gravel", labelPt: "Gravel", icon: "🪨", category: "Cycle" },
  EBikeRide: { label: "E-Bike", labelPt: "E-Bike", icon: "⚡", category: "Cycle" },
  EMountainBikeRide: { label: "E-MTB", labelPt: "E-MTB", icon: "⚡", category: "Cycle" },
  VirtualRide: { label: "Virtual Ride", labelPt: "Ciclismo Virtual", icon: "🚴", category: "Cycle" },
  Velomobile: { label: "Velomobile", labelPt: "Velomobile", icon: "🚲", category: "Cycle" },
  Handcycle: { label: "Handcycle", labelPt: "Handcycle", icon: "♿", category: "Cycle" },
  Swim: { label: "Swim", labelPt: "Natação", icon: "🏊", category: "Water" },
  Surfing: { label: "Surf", labelPt: "Surf", icon: "🏄", category: "Water" },
  StandUpPaddling: { label: "SUP", labelPt: "SUP", icon: "🏄", category: "Water" },
  Kayaking: { label: "Kayak", labelPt: "Caiaque", icon: "🛶", category: "Water" },
  Canoeing: { label: "Canoe", labelPt: "Canoa", icon: "🛶", category: "Water" },
  Rowing: { label: "Row", labelPt: "Remo", icon: "🚣", category: "Water" },
  VirtualRow: { label: "Virtual Row", labelPt: "Remo Virtual", icon: "🚣", category: "Water" },
  Sail: { label: "Sail", labelPt: "Vela", icon: "⛵", category: "Water" },
  Kitesurf: { label: "Kitesurf", labelPt: "Kitesurf", icon: "🪁", category: "Water" },
  Windsurf: { label: "Windsurf", labelPt: "Windsurf", icon: "🏄", category: "Water" },
  AlpineSki: { label: "Alpine Ski", labelPt: "Esqui Alpino", icon: "⛷️", category: "Winter" },
  BackcountrySki: { label: "Backcountry Ski", labelPt: "Esqui Backcountry", icon: "⛷️", category: "Winter" },
  NordicSki: { label: "Nordic Ski", labelPt: "Esqui Nórdico", icon: "🎿", category: "Winter" },
  RollerSki: { label: "Roller Ski", labelPt: "Ski Roller", icon: "🎿", category: "Winter" },
  IceSkate: { label: "Ice Skate", labelPt: "Patins Gelo", icon: "⛸️", category: "Winter" },
  InlineSkate: { label: "Inline Skate", labelPt: "Patins", icon: "🛼", category: "Winter" },
  Snowboard: { label: "Snowboard", labelPt: "Snowboard", icon: "🏂", category: "Winter" },
  Snowshoe: { label: "Snowshoe", labelPt: "Raquetes", icon: "🥾", category: "Winter" },
  WeightTraining: { label: "Weights", labelPt: "Musculação", icon: "🏋️", category: "Strength" },
  Crossfit: { label: "Crossfit", labelPt: "Crossfit", icon: "💪", category: "Strength" },
  Workout: { label: "Workout", labelPt: "Treino", icon: "💪", category: "Strength" },
  HighIntensityIntervalTraining: { label: "HIIT", labelPt: "HIIT", icon: "🔥", category: "Strength" },
  Pilates: { label: "Pilates", labelPt: "Pilates", icon: "🧘", category: "Strength" },
  Yoga: { label: "Yoga", labelPt: "Yoga", icon: "🧘", category: "Strength" },
  Elliptical: { label: "Elliptical", labelPt: "Elíptico", icon: "🏃", category: "Strength" },
  StairStepper: { label: "Stairs", labelPt: "Escadas", icon: "🪜", category: "Strength" },
  PhysicalTherapy: { label: "Physio", labelPt: "Fisioterapia", icon: "🩺", category: "Strength" },
  Tennis: { label: "Tennis", labelPt: "Ténis", icon: "🎾", category: "Court" },
  TableTennis: { label: "Table Tennis", labelPt: "Ténis Mesa", icon: "🏓", category: "Court" },
  Badminton: { label: "Badminton", labelPt: "Badminton", icon: "🏸", category: "Court" },
  Squash: { label: "Squash", labelPt: "Squash", icon: "🎾", category: "Court" },
  Racquetball: { label: "Racquetball", labelPt: "Raquetbol", icon: "🎾", category: "Court" },
  Padel: { label: "Padel", labelPt: "Padel", icon: "🎾", category: "Court" },
  Pickleball: { label: "Pickleball", labelPt: "Pickleball", icon: "🏓", category: "Court" },
  Basketball: { label: "Basketball", labelPt: "Basquetebol", icon: "🏀", category: "Court" },
  Soccer: { label: "Soccer", labelPt: "Futebol", icon: "⚽", category: "Court" },
  Volleyball: { label: "Volleyball", labelPt: "Voleibol", icon: "🏐", category: "Court" },
  Cricket: { label: "Cricket", labelPt: "Críquete", icon: "🏏", category: "Court" },
  Golf: { label: "Golf", labelPt: "Golf", icon: "⛳", category: "Other" },
  RockClimbing: { label: "Climb", labelPt: "Escalada", icon: "🧗", category: "Other" },
  Skateboard: { label: "Skate", labelPt: "Skate", icon: "🛹", category: "Other" },
  Dance: { label: "Dance", labelPt: "Dança", icon: "💃", category: "Other" },
  Wheelchair: { label: "Wheelchair", labelPt: "Cadeira Rodas", icon: "♿", category: "Other" }
};

/** Resolve sport type from API payload (prefers `sport_type`, falls back to legacy `type`). */
export function resolveStravaSportType(
  sportType?: string | null,
  legacyType?: string | null
): StravaSportType | string {
  const raw = sportType ?? legacyType ?? "Workout";
  if (raw in SportTypeConfig) return raw as StravaSportType;
  return raw;
}

export function getSportMeta(sport: string): SportTypeMeta {
  return (
    SportTypeConfig[sport as StravaSportType] ?? {
      label: sport,
      labelPt: sport,
      icon: "🏅",
      category: "Other"
    }
  );
}

export type StravaLatLng = [number, number];

export type StravaMap = {
  id: string;
  polyline?: string;
  summary_polyline?: string;
};

export type StravaSummaryActivity = {
  id: number;
  name: string;
  sport_type?: StravaSportType | string;
  type?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain?: number;
  start_date: string;
  start_date_local: string;
  timezone?: string;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  has_heartrate?: boolean;
  device_name?: string;
  map?: StravaMap;
  suffer_score?: number;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
};

export type StravaDetailedActivity = StravaSummaryActivity & {
  description?: string;
  calories?: number;
  device_watts?: boolean;
  trainer?: boolean;
  commute?: boolean;
  manual?: boolean;
  private?: boolean;
  flagged?: boolean;
  workout_type?: number;
  embed_token?: string;
  laps?: StravaLap[];
  segment_efforts?: StravaSegmentEffort[];
  splits_metric?: StravaSplit[];
  best_efforts?: StravaSegmentEffort[];
};

export type StravaLap = {
  id: number;
  name: string;
  lap_index: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain?: number;
};

export type StravaSegmentEffort = {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  pr_rank?: number | null;
  kom_rank?: number | null;
  segment?: {
    id: number;
    name: string;
    distance: number;
    average_grade: number;
    climb_category: number;
  };
};

export type StravaSplit = {
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_speed: number;
  elevation_difference?: number;
  pace_zone?: number;
};

export type StravaStreamType =
  | "time"
  | "distance"
  | "latlng"
  | "altitude"
  | "velocity_smooth"
  | "heartrate"
  | "cadence"
  | "watts"
  | "temp"
  | "moving"
  | "grade_smooth";

export type StravaStream<T = number | StravaLatLng> = {
  type: StravaStreamType;
  data: T[];
  series_type: "time" | "distance";
  original_size: number;
  resolution: "low" | "medium" | "high";
};

export type StravaWebhookEvent = {
  aspect_type: "create" | "update" | "delete";
  event_time: number;
  object_id: number;
  object_type: "activity" | "athlete";
  owner_id: number;
  subscription_id: number;
  updates?: Record<string, unknown>;
};

export type StravaRateLimit = {
  fifteenMinLimit: number;
  fifteenMinUsage: number;
  dailyLimit: number;
  dailyUsage: number;
};
