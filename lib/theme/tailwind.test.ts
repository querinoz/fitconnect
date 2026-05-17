import { describe, it, expect } from "vitest";
import config from "@/tailwind.config";

describe("tailwind voltline extension", () => {
  const colors = (config.theme?.extend?.colors ?? {}) as Record<string, unknown>;

  it("registers ink palette linked to Voltline CSS vars", () => {
    const ink = colors.ink as Record<string, string>;
    expect(ink["950"]).toBe("var(--ink-950)");
    expect(ink["500"]).toBe("var(--ink-500)");
  });

  it("registers volt palette", () => {
    const volt = colors.volt as Record<string, string>;
    expect(volt["500"]).toBe("var(--volt-500)");
  });

  it("registers glass surfaces", () => {
    const glass = colors.glass as Record<string, string>;
    expect(glass.md).toBe("var(--glass-md)");
    expect(glass.edge).toBe("var(--glass-edge)");
  });
});
