import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireCoachId, requireAthleteId } from "./require-auth";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/auth/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

function mockSession(id: string, role: "athlete" | "coach" | "admin") {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id,
            email: `${id}@fitconnect.app`,
            user_metadata: { role }
          }
        },
        error: null
      })
    }
  } as never);
}

describe("require-auth production IDOR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("binds coach id to the authenticated coach, not the query param", async () => {
    mockSession("coach-self", "coach");
    const result = await requireCoachId(
      new Request("http://localhost/api/v1/roster?coachId=coach-other"),
      "coach-other"
    );
    expect("ok" in result && result.ok === false).toBe(true);
    if ("ok" in result && result.ok === false) {
      expect(result.response.status).toBe(403);
    }
  });

  it("returns the authenticated coach when no param is supplied", async () => {
    mockSession("coach-self", "coach");
    const result = await requireCoachId(new Request("http://localhost/api/v1/roster"));
    expect("coachId" in result).toBe(true);
    if ("coachId" in result) {
      expect(result.coachId).toBe("coach-self");
    }
  });

  it("allows admin to target another coach", async () => {
    mockSession("admin-1", "admin");
    const result = await requireCoachId(
      new Request("http://localhost/api/v1/roster?coachId=coach-other"),
      "coach-other"
    );
    expect("coachId" in result).toBe(true);
    if ("coachId" in result) {
      expect(result.coachId).toBe("coach-other");
    }
  });

  it("rejects athletes targeting another athlete", async () => {
    mockSession("ath-self", "athlete");
    const result = await requireAthleteId(
      new Request("http://localhost/api/v1/sessions?athleteId=ath-other"),
      "ath-other"
    );
    expect("ok" in result && result.ok === false).toBe(true);
    if ("ok" in result && result.ok === false) {
      expect(result.response.status).toBe(403);
    }
  });
});
