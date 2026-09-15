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
      result = { uid: actor.uid, role: actor.role, capabilities: actor.capabilities };
      break;
    case "get_current_readiness":
    case "get_recovery_state":
    case "zenith_explain": {
      const orchestrated = orchestrateZenith({
        athleteId: actor.uid,
        specialist: def.name === "get_recovery_state" ? "recovery" : (args.specialist as never),
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
      result = {
        providers: listFitnessAdapters().map((a) => a.constraints),
        disabledAggregators: DISABLED_AGGREGATORS
      };
      break;
    case "list_public_spots":
      result = await mcpListPublicSpots();
      break;
    case "list_social_feed":
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
