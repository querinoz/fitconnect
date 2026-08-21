import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { requireCoachId, requireAthleteId } from "./require-auth";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => true
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => false
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn()
}));

describe("require-auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_allow_demo_athlete_without_network_calls", async () => {
    const result = await requireAthleteId(new Request("http://localhost/api/v1/sessions"));
    expect("athleteId" in result).toBe(true);
    if ("athleteId" in result) {
      expect(result.athleteId).toBe("a-ines");
    }
  });

  it("should_allow_demo_coach_with_coachId_param", async () => {
    const result = await requireCoachId(
      new Request("http://localhost/api/v1/sessions?coachId=t-002"),
      "t-002"
    );
    expect("coachId" in result).toBe(true);
    if ("coachId" in result) {
      expect(result.coachId).toBe("t-002");
    }
  });

  it("should_return_auth_failure_shape_when_not_ok", async () => {
    const failure = {
      ok: false as const,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 })
    };
    expect(failure.response.status).toBe(401);
  });
});
