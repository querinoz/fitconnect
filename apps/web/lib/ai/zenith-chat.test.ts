import { describe, expect, it } from "vitest";
import { isOpenAiConfigured, ZENITH_CHAT_SYSTEM_PROMPT } from "./zenith-chat";

describe("zenith chat safety", () => {
  it("forbids fabricating metrics in the system prompt", () => {
    expect(ZENITH_CHAT_SYSTEM_PROMPT).toMatch(/Never invent HRV/i);
    expect(ZENITH_CHAT_SYSTEM_PROMPT).toMatch(/Strava/i);
  });

  it("treats missing keys as unconfigured", () => {
    expect(isOpenAiConfigured({} as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(isOpenAiConfigured({ OPENAI_API_KEY: "PASTE_KEY" } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(isOpenAiConfigured({ OPENAI_API_KEY: "sk-test" } as unknown as NodeJS.ProcessEnv)).toBe(true);
  });
});
