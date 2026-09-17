import { z } from "zod";

export type McpDomain =
  | "health"
  | "training"
  | "sports"
  | "athlete"
  | "coach"
  | "recovery"
  | "gps"
  | "social"
  | "booking"
  | "ai"
  | "admin"
  | "integrations";

export type McpRisk = "read" | "write" | "sensitive" | "financial";

export type McpToolDef = {
  name: string;
  domain: McpDomain;
  risk: McpRisk;
  description: string;
  /** Required identity capabilities. Empty = any authenticated user. */
  capabilities: Array<"athlete" | "coach" | "admin">;
  schema: z.ZodType;
};

const empty = z.object({}).strict();

export const MCP_TOOLS: McpToolDef[] = [
  {
    name: "get_athlete_profile",
    domain: "athlete",
    risk: "read",
    description: "Return the authenticated athlete identity profile.",
    capabilities: [],
    schema: empty
  },
  {
    name: "get_user_profile",
    domain: "athlete",
    risk: "read",
    description: "Return the authenticated account identity (same session — ONE LOGIN).",
    capabilities: [],
    schema: empty
  },
  {
    name: "get_coach_profile",
    domain: "coach",
    risk: "read",
    description: "Return coach capability identity for the authenticated session.",
    capabilities: ["coach"],
    schema: empty
  },
  {
    name: "get_current_readiness",
    domain: "health",
    risk: "sensitive",
    description: "Deterministic readiness from provided telemetry. Missing inputs stay MISSING.",
    capabilities: ["athlete"],
    schema: z.object({
      hrvMs: z.number().nullable().optional(),
      baselineHrvMs: z.number().nullable().optional(),
      sleepHours: z.number().nullable().optional(),
      sleepEfficiency: z.number().nullable().optional(),
      strainScore: z.number().nullable().optional()
    })
  },
  {
    name: "get_readiness",
    domain: "health",
    risk: "sensitive",
    description: "Alias of get_current_readiness. Missing inputs stay MISSING.",
    capabilities: ["athlete"],
    schema: z.object({
      hrvMs: z.number().nullable().optional(),
      baselineHrvMs: z.number().nullable().optional(),
      sleepHours: z.number().nullable().optional(),
      sleepEfficiency: z.number().nullable().optional(),
      strainScore: z.number().nullable().optional()
    })
  },
  {
    name: "get_recovery_state",
    domain: "recovery",
    risk: "sensitive",
    description: "Recovery band from zenith-core. Never fabricates HRV/sleep.",
    capabilities: ["athlete"],
    schema: z.object({
      hrvMs: z.number().nullable().optional(),
      sleepHours: z.number().nullable().optional(),
      strainScore: z.number().nullable().optional()
    })
  },
  {
    name: "get_recovery",
    domain: "recovery",
    risk: "sensitive",
    description: "Alias of get_recovery_state. Never fabricates HRV/sleep.",
    capabilities: ["athlete"],
    schema: z.object({
      hrvMs: z.number().nullable().optional(),
      sleepHours: z.number().nullable().optional(),
      strainScore: z.number().nullable().optional()
    })
  },
  {
    name: "get_sleep",
    domain: "health",
    risk: "sensitive",
    description: "Sleep summary when authorized telemetry is supplied. Never invents hours.",
    capabilities: ["athlete"],
    schema: z.object({
      sleepHours: z.number().nullable().optional(),
      sleepEfficiency: z.number().nullable().optional()
    })
  },
  {
    name: "get_hrv",
    domain: "health",
    risk: "sensitive",
    description: "HRV when authorized telemetry is supplied. Missing stays MISSING.",
    capabilities: ["athlete"],
    schema: z.object({
      hrvMs: z.number().nullable().optional(),
      baselineHrvMs: z.number().nullable().optional()
    })
  },
  {
    name: "get_training_load",
    domain: "training",
    risk: "sensitive",
    description: "Training load when strain is provided. Never fabricates load.",
    capabilities: ["athlete"],
    schema: z.object({
      strainScore: z.number().nullable().optional()
    })
  },
  {
    name: "get_activity",
    domain: "training",
    risk: "read",
    description: "Single activity lookup. Returns UNAVAILABLE until activity store is wired for MCP.",
    capabilities: ["athlete"],
    schema: z.object({
      activityId: z.string().min(1).max(128).optional()
    })
  },
  {
    name: "get_workout",
    domain: "training",
    risk: "read",
    description: "Workout plan lookup. Returns UNAVAILABLE until workout store is wired for MCP.",
    capabilities: ["athlete", "coach"],
    schema: z.object({
      workoutId: z.string().min(1).max(128).optional()
    })
  },
  {
    name: "get_device_status",
    domain: "integrations",
    risk: "read",
    description: "Device connection status. Never pretends a device is connected.",
    capabilities: [],
    schema: empty
  },
  {
    name: "get_program",
    domain: "training",
    risk: "read",
    description: "Training program lookup. Returns UNAVAILABLE until program store is wired for MCP.",
    capabilities: ["athlete", "coach"],
    schema: z.object({
      programId: z.string().min(1).max(128).optional()
    })
  },
  {
    name: "get_feed",
    domain: "social",
    risk: "read",
    description: "Alias of list_social_feed. Strava-origin rows excluded by persistence.",
    capabilities: [],
    schema: empty
  },
  {
    name: "get_connections",
    domain: "integrations",
    risk: "read",
    description: "Alias of list_providers — fitness connection registry.",
    capabilities: [],
    schema: empty
  },
  {
    name: "create_workout",
    domain: "training",
    risk: "write",
    description: "Draft a workout. Requires athlete approval before it becomes the plan.",
    capabilities: ["athlete", "coach"],
    schema: z.object({
      sport: z.string().min(1).max(40),
      title: z.string().min(1).max(120),
      notes: z.string().max(2000).optional()
    })
  },
  {
    name: "list_martial_arts",
    domain: "sports",
    risk: "read",
    description: "Martial Arts OS catalog: disciplines, families, ruleset versions. No invented athlete stats.",
    capabilities: [],
    schema: empty
  },
  {
    name: "zenith_combat_context",
    domain: "ai",
    risk: "sensitive",
    description: "Discipline-aware Zenith briefing. Never diagnoses injury or invents force.",
    capabilities: ["athlete", "coach"],
    schema: z.object({
      disciplineId: z.string().min(2).max(64),
      sessionMode: z.string().max(40).optional(),
      experience: z.enum(["beginner", "intermediate", "advanced", "competitor"]).optional(),
      goal: z.string().max(200).optional(),
      round: z.number().int().min(0).max(99).optional(),
      historySessions: z.number().int().min(0).max(100000).optional(),
      presentMetrics: z.array(z.string()).optional()
    })
  },
  {
    name: "list_sport_types",
    domain: "sports",
    risk: "read",
    description: "Canonical sport keys for the all-sports OS.",
    capabilities: [],
    schema: empty
  },
  {
    name: "get_today_session",
    domain: "training",
    risk: "read",
    description:
      "Sport Training Engine today card with explainable WHY. Never invents biometrics.",
    capabilities: ["athlete"],
    schema: z.object({
      sport: z.string().min(2).max(40).optional()
    })
  },
  {
    name: "get_sport_profile",
    domain: "training",
    risk: "read",
    description: "Athlete sports identity (primary/secondary sport, goals, schedule).",
    capabilities: ["athlete", "coach"],
    schema: empty
  },
  {
    name: "search_food",
    domain: "training",
    risk: "sensitive",
    description:
      "Server-side food search via PortFIR/USDA/OFF adapters. Never auto-logs.",
    capabilities: ["athlete"],
    schema: z.object({
      query: z.string().min(1).max(120).optional(),
      barcode: z.string().min(4).max(32).optional(),
      locale: z.string().min(2).max(12).optional()
    })
  },
  {
    name: "get_recipe",
    domain: "training",
    risk: "sensitive",
    description: "Recipe by id with reconciled nutrition per serving.",
    capabilities: ["athlete"],
    schema: z.object({
      recipeId: z.string().min(3).max(80)
    })
  },
  {
    name: "get_nutrition_targets",
    domain: "training",
    risk: "sensitive",
    description:
      "ESTIMATE nutrition targets for sport + training day. Read-only — never writes the diary.",
    capabilities: ["athlete"],
    schema: z.object({
      sport: z.string().min(2).max(40).optional(),
      goal: z.string().min(2).max(40).optional(),
      day: z
        .enum(["rest", "easy", "moderate", "hard", "long", "competition", "recovery"])
        .optional(),
      massKg: z.number().positive().max(400).nullable().optional(),
      durationMin: z.number().positive().max(600).nullable().optional()
    })
  },
  {
    name: "generate_meal_plan",
    domain: "training",
    risk: "sensitive",
    description:
      "Suggest a weekly meal plan with explainable slots + grocery remaining. Never logs meals.",
    capabilities: ["athlete"],
    schema: z.object({
      sport: z.string().min(2).max(40).optional(),
      goal: z.string().min(2).max(40).optional(),
      day: z
        .enum(["rest", "easy", "moderate", "hard", "long", "competition", "recovery"])
        .optional(),
      massKg: z.number().positive().max(400).nullable().optional(),
      weekStart: z.string().min(10).max(12).optional(),
      allergies: z.array(z.string().min(1).max(40)).max(20).optional()
    })
  },
  {
    name: "list_providers",
    domain: "integrations",
    risk: "read",
    description: "Fitness provider registry. Aggregators stay disabled flags.",
    capabilities: [],
    schema: empty
  },
  {
    name: "list_public_spots",
    domain: "gps",
    risk: "read",
    description: "Approximate public training spots. Exact coordinates are never returned.",
    capabilities: [],
    schema: empty
  },
  {
    name: "list_social_feed",
    domain: "social",
    risk: "read",
    description: "Social home feed. Strava-origin rows are excluded by persistence.",
    capabilities: [],
    schema: empty
  },
  {
    name: "create_booking",
    domain: "booking",
    risk: "write",
    description: "Request a booking slot. Double-book checks belong to the bookings API.",
    capabilities: ["athlete"],
    schema: z.object({
      coachId: z.string().min(1).max(128),
      startsAt: z.string().min(10).max(40)
    })
  },
  {
    name: "zenith_explain",
    domain: "ai",
    risk: "sensitive",
    description: "Zenith specialist explanation. Metrics from zenith-core only.",
    capabilities: ["athlete", "coach"],
    schema: z.object({
      specialist: z
        .enum([
          "recovery",
          "training",
          "performance",
          "coach",
          "sports",
          "nutrition",
          "injury_safety",
          "social",
          "planner"
        ])
        .optional(),
      userText: z.string().max(2000).optional(),
      hrvMs: z.number().nullable().optional(),
      sleepHours: z.number().nullable().optional()
    })
  },
  {
    name: "admin_health",
    domain: "admin",
    risk: "read",
    description: "Process health snapshot for operators.",
    capabilities: ["admin"],
    schema: empty
  }
];

export function findMcpTool(name: string): McpToolDef | undefined {
  return MCP_TOOLS.find((t) => t.name === name);
}
