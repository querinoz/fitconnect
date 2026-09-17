/**
 * V8.5 security verification — MCP write boundaries and catalog hygiene.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { dispatchMcp, listMcpCatalog } from "./gateway";
import { resetMcpAuditForTests } from "./audit";

describe("V8.5 MCP security", () => {
  beforeEach(() => {
    resetMcpAuditForTests();
  });

  it("write-adjacent nutrition tools are absent; meal plan is read-sensitive", () => {
    const tools = listMcpCatalog();
    const names = tools.map((t) => t.name);
    expect(names).not.toContain("log_food");
    expect(names).not.toContain("log_meal");
    expect(names).not.toContain("update_nutrition_plan");
    const meal = tools.find((t) => t.name === "generate_meal_plan");
    expect(meal?.risk).toBe("sensitive");
  });

  it("rejects athlete-gated tools when role and capabilities lack athlete", async () => {
    const res = await dispatchMcp(
      { uid: "stranger", role: "anonymous", capabilities: [] },
      { tool: "get_nutrition_targets", arguments: { sport: "RUNNING" } }
    );
    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
  });

  it("catalog never advertises shell/sql/exec tools", () => {
    const names = listMcpCatalog().map((t) => t.name.toLowerCase());
    expect(names.some((n) => /sql|shell|exec|eval/.test(n))).toBe(false);
  });
});
