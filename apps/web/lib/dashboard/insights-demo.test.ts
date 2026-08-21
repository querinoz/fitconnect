import { describe, expect, it } from "vitest";
import { INSIGHTS_HISTORY, historyToCsv } from "./insights-demo";

describe("insights history CSV", () => {
  it("exports a real CSV with header and LOCAL_DEMO rows", () => {
    const csv = historyToCsv(INSIGHTS_HISTORY);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("date,sport,duration,origin,tss");
    expect(lines).toHaveLength(INSIGHTS_HISTORY.length + 1);
    expect(csv).toContain("WATCH");
    expect(csv).toContain("2026-08-16,Run,00:42:11,WATCH,58");
  });

  it("exports only the header when the table is empty", () => {
    expect(historyToCsv([])).toBe("date,sport,duration,origin,tss");
  });
});
