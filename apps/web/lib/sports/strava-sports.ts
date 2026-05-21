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
