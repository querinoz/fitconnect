import { describe, it, expect } from "vitest";
import { COLOR_TOKENS } from "@fitconnect/design-tokens";
import fs from "node:fs";
import path from "node:path";

/** Normalize hex for comparison (#070B14 === #070b14). */
function norm(hex: string): string {
  return hex.toLowerCase().replace(/^#/, "");
}

describe("COLOR_TOKENS ↔ elite-os.css sync", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/elite-os.css"),
    "utf8"
  );

  const cssVarMap: Record<string, string> = {};
  const re = /--eos-([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    cssVarMap[m[1]!] = m[2]!;
  }

  const pairs: Array<[keyof typeof COLOR_TOKENS, string]> = [
    // Chart series (ADR-011) -- garante que TS e CSS nao divergem.
    ["chartSeries1", "chart-1"],
    ["chartSeries2", "chart-2"],
    ["chartSeries3", "chart-3"],
    ["chartSeries4", "chart-4"],
    ["chartSeq1", "chart-seq-1"],
    ["chartSeq6", "chart-seq-6"],
    ["chartDivWarm3", "chart-div-warm-3"],
    ["chartDivMid", "chart-div-mid"],
    ["chartDivCool3", "chart-div-cool-3"],
    ["chartInk", "chart-ink"],
    ["floor", "floor"],
    ["voltline", "voltline"],
    ["connect", "connect"],
    ["iris", "iris"],
    ["telemetry", "telemetry"],
    ["performance", "performance"],
    ["recovery", "recovery"],
    ["alert", "alert"],
    ["onSurface", "on-surface"],
    ["patentSteel", "patent-steel"],
    ["patentMint", "patent-mint"],
    ["patentLegend", "patent-legend"],
    ["patentEmber", "patent-ember"],
  ];

  it.each(pairs)("COLOR_TOKENS.%s matches --eos-%s in CSS", (tokenKey, cssKey) => {
    const tokenVal = COLOR_TOKENS[tokenKey];
    const cssVal = cssVarMap[cssKey];
    expect(cssVal, `missing --eos-${cssKey} in elite-os.css`).toBeDefined();
    if (tokenVal.startsWith("#") && cssVal.startsWith("#")) {
      expect(norm(tokenVal)).toBe(norm(cssVal));
    }
  });
});
