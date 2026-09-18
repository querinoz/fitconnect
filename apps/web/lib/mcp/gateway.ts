import { orchestrateZenith } from "@fitconnect/ai";
import { DISABLED_AGGREGATORS } from "@fitconnect/types";
import { listFitnessAdapters } from "@/lib/fitness/adapters";
import { zenithCombatContext } from "@/lib/combat";
import { findMcpTool, MCP_TOOLS } from "./catalog";
import {
  mcpAdminHealth,
  mcpCanonicalSports,
  mcpCreateBooking,
  mcpListPublicSpots,
  mcpListSocialFeed,
  mcpMartialArtsCatalog
} from "./data";
import { recordMcpAudit } from "./audit";
import { looksLikePromptInjection, sanitizeUntrustedText } from "./sanitize";

export type McpActor = {
  uid: string;
  role: string;
  capabilities: string[];
};

export type McpCall = {
  tool: string;
  arguments?: Record<string, unknown>;
};

export type McpResult = {
  ok: boolean;
  tool: string;
  domain?: string;
  risk?: string;
  result?: unknown;
  error?: string;
  status: number;
};

function hasCapability(actor: McpActor, needed: string[]): boolean {
  if (needed.length === 0) return true;
  if (actor.role === "admin") return true;
  return needed.some((c) => actor.capabilities.includes(c) || actor.role === c);
}

export function listMcpCatalog() {
  return MCP_TOOLS.map((t) => ({
    name: t.name,
    domain: t.domain,
    risk: t.risk,
    description: t.description
  }));
}

function auditAndReturn(actor: McpActor, result: McpResult): McpResult {
  recordMcpAudit({
    uid: actor.uid,
    tool: result.tool,
    ok: result.ok,
    status: result.status,
    risk: result.risk,
    error: result.error
  });
  return result;
}

export async function dispatchMcp(actor: McpActor, call: McpCall): Promise<McpResult> {
  const def = findMcpTool(call.tool);
  if (!def) {
    return auditAndReturn(actor, { ok: false, tool: call.tool, error: "unknown_tool", status: 404 });
  }
  if (!hasCapability(actor, def.capabilities)) {
    return auditAndReturn(actor, {
      ok: false,
      tool: def.name,
      domain: def.domain,
      risk: def.risk,
      error: "forbidden",
      status: 403
    });
  }

  const parsed = def.schema.safeParse(call.arguments ?? {});
  if (!parsed.success) {
    return auditAndReturn(actor, {
      ok: false,
      tool: def.name,
      domain: def.domain,
      risk: def.risk,
      error: "invalid_arguments",
      status: 422
    });
  }

  const args = parsed.data as Record<string, unknown>;
  const rawUserText =
    typeof args.userText === "string" ? args.userText : undefined;

  let result: unknown;
  switch (def.name) {
    case "get_athlete_profile":
    case "get_user_profile":
      result = { uid: actor.uid, role: actor.role, capabilities: actor.capabilities };
      break;
    case "get_coach_profile":
      result = {
        uid: actor.uid,
        role: actor.role,
        capabilities: actor.capabilities,
        experience: "coach"
      };
      break;
    case "get_current_readiness":
    case "get_readiness":
    case "get_recovery_state":
    case "get_recovery":
    case "zenith_explain": {
      const orchestrated = orchestrateZenith({
        athleteId: actor.uid,
        specialist:
          def.name === "get_recovery_state" || def.name === "get_recovery"
            ? "recovery"
            : (args.specialist as never),
        userText: rawUserText,
        hrvMs: typeof args.hrvMs === "number" ? args.hrvMs : null,
        baselineHrvMs: typeof args.baselineHrvMs === "number" ? args.baselineHrvMs : null,
        sleepHours: typeof args.sleepHours === "number" ? args.sleepHours : null,
        sleepEfficiency: typeof args.sleepEfficiency === "number" ? args.sleepEfficiency : null,
        strainScore: typeof args.strainScore === "number" ? args.strainScore : null
      });
      result = {
        ...orchestrated,
        injectionDetected: looksLikePromptInjection(rawUserText)
      };
      break;
    }
    case "get_sleep": {
      const hours = typeof args.sleepHours === "number" ? args.sleepHours : null;
      const efficiency =
        typeof args.sleepEfficiency === "number" ? args.sleepEfficiency : null;
      result = {
        sleepHours: {
          value: hours,
          provenance: hours == null ? "MISSING" : "PROVIDED"
        },
        sleepEfficiency: {
          value: efficiency,
          provenance: efficiency == null ? "MISSING" : "PROVIDED"
        }
      };
      break;
    }
    case "get_hrv": {
      const hrv = typeof args.hrvMs === "number" ? args.hrvMs : null;
      const baseline = typeof args.baselineHrvMs === "number" ? args.baselineHrvMs : null;
      result = {
        hrvMs: { value: hrv, provenance: hrv == null ? "MISSING" : "PROVIDED" },
        baselineHrvMs: {
          value: baseline,
          provenance: baseline == null ? "MISSING" : "PROVIDED"
        }
      };
      break;
    }
    case "get_training_load": {
      const { computeTrainingLoad } = await import("@/lib/sports-intelligence/training-load");
      const { listAthleteEvents } = await import("@/lib/sports-intelligence/event-store");
      const events = listAthleteEvents(actor.uid, { limit: 200 });
      const sessions = events
        .filter((e) => e.type === "WORKOUT_COMPLETED" || e.type === "SPORT_ACTIVITY_COMPLETED")
        .map((e) => ({
          dateISO: e.timestamp.slice(0, 10),
          strain:
            typeof e.payload.strain === "number"
              ? e.payload.strain
              : typeof args.strainScore === "number"
                ? args.strainScore
                : typeof e.payload.durationMin === "number"
                  ? e.payload.durationMin
                  : 0
        }))
        .filter((s) => s.strain > 0);
      // Allow caller-provided single strain only as ADDITIONAL session when no history
      if (!sessions.length && typeof args.strainScore === "number") {
        sessions.push({
          dateISO: new Date().toISOString().slice(0, 10),
          strain: args.strainScore
        });
      }
      const load = computeTrainingLoad(sessions);
      result = {
        ...load,
        strainScore: {
          value: typeof args.strainScore === "number" ? args.strainScore : load.acute7d,
          provenance:
            typeof args.strainScore === "number"
              ? "PROVIDED"
              : load.provenance === "MISSING"
                ? "MISSING"
                : "CALCULATED"
        }
      };
      break;
    }
    case "get_activity":
    case "get_workout":
    case "get_program":
      result = {
        status: "UNAVAILABLE",
        reason: "mcp_store_not_wired",
        id:
          typeof args.activityId === "string"
            ? args.activityId
            : typeof args.workoutId === "string"
              ? args.workoutId
              : typeof args.programId === "string"
                ? args.programId
                : null
      };
      break;
    case "get_device_status": {
      const { listDeviceRegistry } = await import("@/lib/devices/platform");
      const devices = listDeviceRegistry();
      const anyLive = devices.some(
        (d) => d.status === "CONNECTED" || d.status === "SYNCED" || d.status === "SYNCING"
      );
      result = {
        devices,
        status: anyLive ? "PARTIAL" : "NOT_CONNECTED",
        note: "Never reports connected without a live provider session / explicit confirm."
      };
      break;
    }
    case "create_workout":
      result = {
        draft: true,
        requiresApproval: true,
        sport: args.sport,
        title: args.title,
        notes: sanitizeUntrustedText(typeof args.notes === "string" ? args.notes : undefined),
        athleteId: actor.uid
      };
      break;
    case "list_sport_types":
      result = mcpCanonicalSports();
      break;
    case "get_today_session": {
      const { adaptTodaySession } = await import("@/lib/sport-intelligence/adaptation-engine");
      const { emptySportsIdentity } = await import("@/lib/sport-intelligence/sports-identity");
      const sportMod = await import("@/lib/sport-intelligence/sport-registry");
      const profile = emptySportsIdentity(actor.uid);
      const sportArg = typeof args.sport === "string" ? args.sport : null;
      if (sportArg && sportArg in sportMod.SPORT_REGISTRY) {
        profile.primarySport = sportArg as import("@/lib/sport-intelligence/sport-registry").SportId;
      }
      const card = adaptTodaySession({
        profile,
        readiness: {
          score: null,
          band: null,
          source: "mcp_no_telemetry",
          available: false,
          detail: "Pass readiness via product APIs — MCP does not invent scores."
        },
        recentPlanIds: []
      });
      result = {
        today: card,
        note: "Catalog/adaptation only. Biometrics remain MISSING unless provided by authorized product APIs."
      };
      break;
    }
    case "get_sport_profile": {
      const { readSportsIdentity } = await import("@/lib/sport-intelligence/identity-repository");
      const { profile, backend } = await readSportsIdentity(actor.uid);
      result = { profile, backend, note: "Sports identity — empty fields stay null, never invented." };
      break;
    }
    case "search_food": {
      const { lookupFoods } = await import("@/lib/nutrition/sources/food-lookup");
      const looked = await lookupFoods({
        query: typeof args.query === "string" ? args.query : undefined,
        barcode: typeof args.barcode === "string" ? args.barcode : undefined,
        locale: typeof args.locale === "string" ? args.locale : undefined
      });
      result = {
        foods: looked.foods,
        state: looked.state,
        note: `${looked.note} MCP never logs food.`
      };
      break;
    }
    case "get_recipe": {
      const { getRecipeById, computeRecipeNutrition } = await import("@/lib/nutrition/recipes");
      const id = String(args.recipeId ?? "");
      const recipe = getRecipeById(id);
      result = {
        recipe: recipe ?? null,
        nutrition: recipe ? computeRecipeNutrition(recipe) : null,
        note: recipe ? null : "Unknown recipe — not fabricated."
      };
      break;
    }
    case "get_nutrition_targets": {
      const { planDailyTargets } = await import("@/lib/nutrition/planning-engine");
      const sportMod = await import("@/lib/sport-intelligence/sport-registry");
      const sportArg = typeof args.sport === "string" ? args.sport : "GENERAL_FITNESS";
      const sport =
        sportArg in sportMod.SPORT_REGISTRY
          ? sportMod.SPORT_REGISTRY[
              sportArg as import("@/lib/sport-intelligence/sport-registry").SportId
            ]
          : sportMod.SPORT_REGISTRY.GENERAL_FITNESS;
      const goal =
        typeof args.goal === "string"
          ? (args.goal as import("@/lib/nutrition/types").NutritionGoal)
          : null;
      const day =
        typeof args.day === "string"
          ? (args.day as
              | "rest"
              | "easy"
              | "moderate"
              | "hard"
              | "long"
              | "competition"
              | "recovery")
          : "moderate";
      const targets = planDailyTargets({
        profile: {
          userId: actor.uid,
          goal,
          dietPattern: null,
          allergies: [],
          intolerances: [],
          dislikes: [],
          religiousRestrictions: [],
          mealFrequency: null,
          countryLocale: "pt-PT",
          highRiskContext: false,
          declaredMedicalContext: false
        },
        sportNutritionKey: sport.nutritionProfileKey,
        trainingDayKind: day,
        bodyMassKg: typeof args.massKg === "number" ? args.massKg : null,
        sessionDurationMin: typeof args.durationMin === "number" ? args.durationMin : null
      });
      result = {
        sportId: sport.id,
        targets,
        estimateKind: targets.estimateKind,
        note: "Read-only ESTIMATE. Diary writes require explicit user confirmation."
      };
      break;
    }
    case "generate_meal_plan": {
      const { generateWeeklyMealPlan } = await import("@/lib/nutrition/meal-planner");
      const { buildGroceryList } = await import("@/lib/nutrition/grocery");
      const sportMod = await import("@/lib/sport-intelligence/sport-registry");
      const sportArg = typeof args.sport === "string" ? args.sport : "GENERAL_FITNESS";
      const sport =
        sportArg in sportMod.SPORT_REGISTRY
          ? sportMod.SPORT_REGISTRY[
              sportArg as import("@/lib/sport-intelligence/sport-registry").SportId
            ]
          : sportMod.SPORT_REGISTRY.GENERAL_FITNESS;
      const day =
        typeof args.day === "string"
          ? (args.day as
              | "rest"
              | "easy"
              | "moderate"
              | "hard"
              | "long"
              | "competition"
              | "recovery")
          : "moderate";
      const allergies = Array.isArray(args.allergies)
        ? args.allergies.filter((a): a is string => typeof a === "string")
        : [];
      const plan = generateWeeklyMealPlan({
        profile: {
          userId: actor.uid,
          goal:
            typeof args.goal === "string"
              ? (args.goal as import("@/lib/nutrition/types").NutritionGoal)
              : "PERFORMANCE",
          dietPattern: null,
          allergies,
          intolerances: [],
          dislikes: [],
          religiousRestrictions: [],
          mealFrequency: 4,
          countryLocale: "pt-PT",
          highRiskContext: false,
          declaredMedicalContext: false
        },
        sportNutritionKey: sport.nutritionProfileKey,
        trainingDayKind: day,
        bodyMassKg: typeof args.massKg === "number" ? args.massKg : 70,
        sessionDurationMin: 45,
        weekStartISO:
          typeof args.weekStart === "string" ? args.weekStart : new Date().toISOString().slice(0, 10)
      });
      result = {
        plan,
        grocery: buildGroceryList(plan),
        note: "Suggestion only — logging meals requires explicit user confirmation."
      };
      break;
    }
    case "list_martial_arts":
      result = mcpMartialArtsCatalog();
      break;
    case "zenith_combat_context": {
      const ctx = zenithCombatContext({
        disciplineId: String(args.disciplineId),
        sessionMode: typeof args.sessionMode === "string" ? (args.sessionMode as never) : null,
        experience: typeof args.experience === "string" ? (args.experience as never) : null,
        goal: typeof args.goal === "string" ? args.goal : null,
        round: typeof args.round === "number" ? args.round : null,
        historySessions: typeof args.historySessions === "number" ? args.historySessions : null,
        presentMetrics: Array.isArray(args.presentMetrics) ? (args.presentMetrics as string[]) : []
      });
      result = ctx ?? { error: "unknown_discipline", medicalClaims: false };
      break;
    }
    case "list_providers":
    case "get_connections":
      result = {
        providers: listFitnessAdapters().map((a) => a.constraints),
        disabledAggregators: DISABLED_AGGREGATORS
      };
      break;
    case "list_public_spots":
      result = await mcpListPublicSpots();
      break;
    case "list_social_feed":
    case "get_feed":
      result = await mcpListSocialFeed();
      break;
    case "create_booking": {
      const booked = await mcpCreateBooking({
        athleteId: actor.uid,
        coachId: String(args.coachId),
        startsAt: String(args.startsAt)
      });
      if (!booked.ok) {
        return auditAndReturn(actor, {
          ok: false,
          tool: def.name,
          domain: def.domain,
          risk: def.risk,
          error: booked.error,
          status: booked.error === "scheduledAt_in_past" ? 422 : 409
        });
      }
      result = booked;
      break;
    }
    case "admin_health":
      result = mcpAdminHealth();
      break;
    default:
      return auditAndReturn(actor, { ok: false, tool: def.name, error: "unhandled_tool", status: 500 });
  }

  return auditAndReturn(actor, {
    ok: true,
    tool: def.name,
    domain: def.domain,
    risk: def.risk,
    result,
    status: 200
  });
}
