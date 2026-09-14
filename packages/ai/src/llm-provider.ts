import { resolveLlmRoute, type LlmRoute } from "./orchestrator";

/**
 * Vendor-neutral LLM port. Scores never come from a provider.
 * OpenAI is one optional remote adapter — not the only allowed vendor.
 */
export type LLMProvider = {
  id: string;
  route: LlmRoute;
};

function hasKey(value: string | undefined): boolean {
  const key = value?.trim();
  return Boolean(key && !key.includes("PASTE_"));
}

export function resolveLlmProvider(env: NodeJS.Dict<string> = process.env): LLMProvider {
  if (env.ZENITH_LLM_ROUTE === "local") {
    return { id: "local-rules", route: "local" };
  }
  if (env.ZENITH_LLM_ROUTE === "fallback") {
    return { id: "none", route: "fallback" };
  }

  const vendor = env.ZENITH_LLM_VENDOR?.trim().toLowerCase();
  if (vendor === "anthropic" && hasKey(env.ANTHROPIC_API_KEY)) {
    return { id: "anthropic", route: "remote" };
  }
  if (vendor === "gemini" && hasKey(env.GEMINI_API_KEY)) {
    return { id: "gemini", route: "remote" };
  }
  if (hasKey(env.OPENAI_API_KEY)) {
    return { id: "openai", route: "remote" };
  }
  if (hasKey(env.ANTHROPIC_API_KEY)) {
    return { id: "anthropic", route: "remote" };
  }
  if (hasKey(env.GEMINI_API_KEY)) {
    return { id: "gemini", route: "remote" };
  }

  return { id: "none", route: resolveLlmRoute(env) };
}
