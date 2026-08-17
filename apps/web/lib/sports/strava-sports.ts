/** All Strava sport types supported by FitConnect. */
export const STRAVA_SPORT_TYPES = [
  "AlpineSki",
  "BackcountrySki",
  "Badminton",
  "Canoeing",
  "Crossfit",
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
  "Walk",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga"
] as const;

export type StravaSportType = (typeof STRAVA_SPORT_TYPES)[number];

export const SPORT_CATEGORIES: {
  id: string;
  emoji: string;
  labelKey: string;
  sports: StravaSportType[];
}[] = [
  {
    id: "cycling",
    emoji: "🚴",
    labelKey: "cycling",
    sports: [
      "Ride",
      "GravelRide",
      "MountainBikeRide",
      "EMountainBikeRide",
      "EBikeRide",
      "VirtualRide",
      "Velomobile",
      "Handcycle"
    ]
  },
  {
    id: "running",
    emoji: "🏃",
    labelKey: "running",
    sports: ["Run", "TrailRun", "VirtualRun", "Walk", "Hike"]
  },
  { id: "swimming", emoji: "🏊", labelKey: "swimming", sports: ["Swim", "VirtualRow"] },
  {
    id: "winter",
    emoji: "❄️",
    labelKey: "winter",
    sports: [
      "AlpineSki",
      "BackcountrySki",
      "NordicSki",
      "Snowboard",
      "Snowshoe",
      "IceSkate",
      "RollerSki"
    ]
  },
  {
    id: "water",
    emoji: "🌊",
    labelKey: "water",
    sports: [
      "Kayaking",
      "Canoeing",
      "Rowing",
      "Surfing",
      "StandUpPaddling",
      "Kitesurf",
      "Windsurf",
      "Sail"
    ]
  },
  {
    id: "strength",
    emoji: "💪",
    labelKey: "strength",
    sports: [
      "WeightTraining",
      "Crossfit",
      "HighIntensityIntervalTraining",
      "Elliptical",
      "StairStepper",
      "Workout"
    ]
  },
  {
    id: "mind",
    emoji: "🧘",
    labelKey: "mind",
    sports: ["Yoga", "Pilates"]
  },
  {
    id: "racket",
    emoji: "🎾",
    labelKey: "racket",
    sports: ["Tennis", "Squash", "Badminton", "Racquetball", "Pickleball", "TableTennis"]
  },
  {
    id: "other",
    emoji: "🏌️",
    labelKey: "other",
    sports: ["Golf", "Soccer", "RockClimbing", "Skateboard", "Wheelchair", "InlineSkate"]
  }
];

const SPORT_LABELS: Partial<Record<StravaSportType, string>> = {
  EBikeRide: "E-Bike",
  EMountainBikeRide: "E-MTB",
  MountainBikeRide: "MTB",
  HighIntensityIntervalTraining: "HIIT",
  StandUpPaddling: "SUP",
  VirtualRide: "Virtual Ride",
  VirtualRun: "Virtual Run",
  VirtualRow: "Virtual Row",
  WeightTraining: "Weights",
  TrailRun: "Trail Run",
  AlpineSki: "Alpine Ski",
  BackcountrySki: "Backcountry",
  NordicSki: "Nordic Ski",
  TableTennis: "Table Tennis",
  RockClimbing: "Climbing",
  InlineSkate: "Inline Skate",
  IceSkate: "Ice Skate",
  GravelRide: "Gravel",
  StairStepper: "Stepper",
  RollerSki: "Roller Ski"
};

/** Human label for a Strava camelCase sport id — never overflow a tile with the raw id. */
export function formatStravaSportLabel(sport: string): string {
  const mapped = SPORT_LABELS[sport as StravaSportType];
  if (mapped) return mapped;
  return sport
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
}

/** Short SYS.* code for telemetry labels (MTB, HIIT, RIDE). */
export function sportSysCode(sport: string): string {
  const mapped = SPORT_LABELS[sport as StravaSportType];
  if (mapped) {
    const compact = mapped.replace(/[\s-]/g, "").toUpperCase();
    if (compact.length <= 8) return compact;
  }
  const caps = sport.replace(/[a-z]+/g, "");
  if (caps.length >= 2) return caps.slice(0, 6);
  return sport.slice(0, 6).toUpperCase();
}

/** Deterministic LOCAL_DEMO volume — same on server and client. */
export function demoSportVolume(sport: string): number {
  let h = 0;
  for (let i = 0; i < sport.length; i++) h = (h + sport.charCodeAt(i) * 17) % 997;
  return 100 + (h % 900);
}
