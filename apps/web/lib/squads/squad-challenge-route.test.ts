import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/squads/challenges/[id]/route";
import { resetSquadChallengesForTests } from "@/lib/squads/server-challenges";

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

const ctx = { params: Promise.resolve({ id: "squad-fc-week" }) };

describe("/api/v1/squads/challenges/[id]", () => {
  beforeEach(() => {
    resetSquadChallengesForTests();
  });

  it("returns default squad-fc-week challenge", async () => {
    const res = await GET(new Request("http://localhost"), ctx);
    const body = await res.json();
    expect(body.challenge.id).toBe("squad-fc-week");
    expect(body.challenge.targetM).toBe(50_000);
  });

  it("joins and accumulates squad contributions", async () => {
    await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" })
      }),
      ctx
    );
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "contribute", distanceM: 1200 })
      }),
      ctx
    );
    const body = await res.json();
    expect(body.challenge.progressM).toBe(1200);
    expect(body.challenge.lifecycle).toBe("ACTIVE");
    expect(body.challenge.contributions["a-ines"]).toBe(1200);
  });
});
