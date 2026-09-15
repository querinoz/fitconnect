import { describe, expect, it } from "vitest";
import { ingestWhoopWebhook } from "./whoop";

describe("WHOOP v2 ingest", () => {
  it("does not invent recovery from a webhook envelope", () => {
    const result = ingestWhoopWebhook({
      user_id: 123,
      id: "550e8400-e29b-41d4-a716-446655440000",
      type: "recovery.updated",
      trace_id: "trace"
    });
    expect(result.events).toEqual([]);
    expect(result.pendingFetch?.resource).toBe("recovery");
    expect(result.result.accepted).toBe(0);
  });

  it("maps scores from a GET /v2/recovery resource", () => {
    const result = ingestWhoopWebhook({
      user_id: 123,
      score: {
        recovery_score: 64,
        resting_heart_rate: 51,
        hrv_rmssd_milli: 72
      },
      updated_at: "2026-09-15T00:00:00Z"
    });
    expect(result.pendingFetch).toBeNull();
    expect(result.events).toHaveLength(3);
    expect(result.events.some((e) => e.metric === "hrv" && e.value === 72)).toBe(true);
  });
});
