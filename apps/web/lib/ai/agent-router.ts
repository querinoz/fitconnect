/**
 * V10.4 AI Agent Platform — router + specialist agents.
 * Agents only call authorized MCP tools; never fabricate tool results.
 */

export type AgentId =
  | "TRAINING"
  | "NUTRITION"
  | "RECOVERY"
  | "PERFORMANCE"
  | "DEVICE"
  | "SPORT"
  | "COACH"
  | "RESEARCH";

export type AgentRouteResult = {
  agent: AgentId;
  reason: string;
  suggestedTools: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

const RULES: Array<{ match: RegExp; agent: AgentId; tools: string[]; reason: string }> = [
  {
    match: /train|session|workout|sets?|reps?|interval|deload|progression/i,
    agent: "TRAINING",
    tools: ["get_today_session", "get_training_load", "get_sport_profile"],
    reason: "Query classified as training"
  },
  {
    match: /eat|meal|food|recipe|grocery|protein|carb|hydrat/i,
    agent: "NUTRITION",
    tools: ["get_nutrition_targets", "search_food", "get_recipe", "generate_meal_plan"],
    reason: "Query classified as nutrition"
  },
  {
    match: /recover|sleep|hrv|readiness|sore|fatigue/i,
    agent: "RECOVERY",
    tools: ["get_readiness", "get_recovery", "get_sleep", "get_hrv"],
    reason: "Query classified as recovery"
  },
  {
    match: /device|watch|garmin|whoop|sync|sensor|wear/i,
    agent: "DEVICE",
    tools: ["get_device_status", "list_providers"],
    reason: "Query classified as devices"
  },
  {
    match: /coach|athlete roster|program for athlete/i,
    agent: "COACH",
    tools: ["get_coach_profile", "get_today_session"],
    reason: "Query classified as coach"
  },
  {
    match: /perform|pr|race|competition|pace|power/i,
    agent: "PERFORMANCE",
    tools: ["get_training_load", "get_today_session", "get_activity"],
    reason: "Query classified as performance"
  }
];

export function routeAgentQuery(query: string): AgentRouteResult {
  const q = query.trim();
  if (!q) {
    return {
      agent: "SPORT",
      reason: "Empty query — default sport agent",
      suggestedTools: ["get_sport_profile", "list_sport_types"],
      confidence: "LOW"
    };
  }
  for (const rule of RULES) {
    if (rule.match.test(q)) {
      return {
        agent: rule.agent,
        reason: rule.reason,
        suggestedTools: rule.tools,
        confidence: "MEDIUM"
      };
    }
  }
  return {
    agent: "SPORT",
    reason: "No specialist match — sport generalist",
    suggestedTools: ["get_today_session", "get_readiness", "zenith_explain"],
    confidence: "LOW"
  };
}

export type AgentAnswerSkeleton = {
  what: string;
  why: string;
  data: string[];
  source: string;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NOT_AVAILABLE";
  action: string | null;
  requiresConfirm: boolean;
};

/** Builds explainable shell — callers must fill with real MCP tool results only */
export function buildAgentAnswerShell(
  route: AgentRouteResult,
  toolNotes: string[]
): AgentAnswerSkeleton {
  return {
    what: `${route.agent} agent selected`,
    why: route.reason,
    data: toolNotes.length ? toolNotes : ["No tool results yet — NOT_AVAILABLE"],
    source: `agent:${route.agent}`,
    confidence: toolNotes.length ? route.confidence : "NOT_AVAILABLE",
    action: null,
    requiresConfirm: true
  };
}
