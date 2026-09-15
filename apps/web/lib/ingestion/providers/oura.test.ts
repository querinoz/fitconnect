import { describe, expect, it } from "vitest";
import { ingestOuraWebhook } from "./oura";

describe("Oura V2 ingest", () => {
  it("does not invent readiness from a webhook ping", () => {
    const result = ingestOuraWebhook({
      event_type: "create",
      data_type: "daily_readiness",
      object_id: "abc-123"
    });
    expect(result.events).toEqual([]);
    expect(result.pendingFetch?.objectId).toBe("abc-123");
  });

  it("maps a daily readiness resource score", () => {
    const result = ingestOuraWebhook({
      user_id: "oura-user",
      score: 77,
      day: "2026-09-14"
    });
    expect(result.pendingFetch).toBeNull();
    expect(result.events[0]?.metric).toBe("readiness_score");
    expect(result.events[0]?.value).toBe(77);
  });
});
