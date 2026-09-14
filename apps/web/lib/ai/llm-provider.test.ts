import { describe, expect, it } from "vitest";
import { resolveLlmProvider } from "@fitconnect/ai";

describe("LLMProvider", () => {
  it("falls back when no vendor key is set", () => {
    expect(resolveLlmProvider({}).route).toBe("fallback");
    expect(resolveLlmProvider({}).id).toBe("none");
  });

  it("can select a non-OpenAI vendor", () => {
    const p = resolveLlmProvider({
      ZENITH_LLM_VENDOR: "anthropic",
      ANTHROPIC_API_KEY: "sk-ant-test"
    });
    expect(p.id).toBe("anthropic");
    expect(p.route).toBe("remote");
  });

  it("honors local route without a cloud vendor", () => {
    expect(resolveLlmProvider({ ZENITH_LLM_ROUTE: "local" })).toEqual({
      id: "local-rules",
      route: "local"
    });
  });
});
