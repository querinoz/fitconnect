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
