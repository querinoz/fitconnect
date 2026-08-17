import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { resolveIntegrationAthlete, resolveIntegrationCoach } from "./route-auth";

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

describe("strava route-auth production IDOR", () => {
  const prevDemo = process.env.NEXT_PUBLIC_DEMO_MODE;
  const prevSecret = process.env.INTEGRATION_AUTH_SECRET;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    delete process.env.INTEGRATION_AUTH_SECRET;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = prevDemo;
    process.env.INTEGRATION_AUTH_SECRET = prevSecret;
  });

  it("rejects athleteId that disagrees with the authenticated session", async () => {
    mockSession("ath-self", "athlete");
    const result = await resolveIntegrationAthlete(
      new Request("http://localhost/api/v1/integrations/strava?athleteId=ath-other"),
      "ath-other"
    );
    expect(result).toEqual({ error: "athlete_mismatch", status: 403 });
  });

  it("binds athlete to the authenticated session when param matches", async () => {
    mockSession("ath-self", "athlete");
    const result = await resolveIntegrationAthlete(
      new Request("http://localhost/api/v1/integrations/strava?athleteId=ath-self"),
      "ath-self"
    );
    expect(result).toEqual({ athleteId: "ath-self" });
  });

  it("rejects coachId that disagrees with the authenticated session", async () => {
    mockSession("coach-self", "coach");
    const result = await resolveIntegrationCoach(
      new Request("http://localhost/api/v1/integrations?coachId=coach-other"),
      "coach-other"
    );
    expect(result).toEqual({ error: "coach_mismatch", status: 403 });
  });

  it("does not allow a missing session to fall back to a client param", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
      }
    } as never);
    const result = await resolveIntegrationCoach(
      new Request("http://localhost/api/v1/integrations?coachId=attacker"),
      "attacker"
    );
    expect(result).toEqual({ error: "unauthorized", status: 401 });
  });

  it("allows machine jobs with INTEGRATION_AUTH_SECRET", async () => {
    process.env.INTEGRATION_AUTH_SECRET = "job-secret";
    const result = await resolveIntegrationAthlete(
      new Request("http://localhost/api/v1/integrations/strava", {
        headers: {
          authorization: "Bearer job-secret",
          "x-athlete-id": "job-athlete"
        }
      })
    );
    expect(result).toEqual({ athleteId: "job-athlete" });
  });
});
