import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/ascend/progression/route";
import { resetProgressionForTests } from "@/lib/progression/server-store";

vi.mock("@/lib/api/require-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/require-auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue({
      ok: true,
      user: { id: "a-ines", role: "athlete", email: "ines@fitconnect.app" },
      supabaseUserId: "a-ines",
      demo: true
    })
  };
});

describe("/api/v1/ascend/progression", () => {
  beforeEach(() => {
    resetProgressionForTests();
  });

  it("returns canonical progression snapshot", async () => {
    const res = await GET(new Request("http://localhost/api/v1/ascend/progression"));
    const body = await res.json();
    expect(body.source).toBe("memory");
    expect(body.progression.level.level).toBeGreaterThanOrEqual(1);
    expect(body.progression.totalXp).toBe(120);
  });

  it("deduplicates events by eventId", async () => {
    const body = JSON.stringify({
      eventId: "evt-workout-1",
      type: "WORKOUT_COMPLETED",
      payload: { distanceM: 5000 }
    });
    const first = await (
      await POST(
        new Request("http://localhost/api/v1/ascend/progression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        })
      )
    ).json();
    const second = await (
      await POST(
        new Request("http://localhost/api/v1/ascend/progression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body
        })
      )
    ).json();
    expect(first.status).toBe("APPLIED");
    expect(first.awardedXp).toBeGreaterThan(0);
    expect(second.status).toBe("DUPLICATE");
    expect(second.awardedXp).toBe(0);
  });
});
