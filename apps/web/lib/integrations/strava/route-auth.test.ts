import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resolveIntegrationAthlete, resolveIntegrationCoach, verifyQStashJob } from "./route-auth";
import { encodeUnsignedTestJwt } from "@/lib/auth/firebase-id-token";
import { lookupIdentityRole } from "@/lib/identity/repository";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => true
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
  headers: async () => new Headers()
}));

function authedRequest(uid: string, path: string) {
  const token = encodeUnsignedTestJwt({ sub: uid, email: `${uid}@fitconnect.app` });
  return new Request(`http://localhost${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
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
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    const result = await resolveIntegrationAthlete(
      authedRequest("ath-self", "/api/v1/integrations/strava?athleteId=ath-other"),
      "ath-other"
    );
    expect(result).toEqual({ error: "athlete_mismatch", status: 403 });
  });

  it("binds athlete to the authenticated session when param matches", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    const result = await resolveIntegrationAthlete(
      authedRequest("ath-self", "/api/v1/integrations/strava?athleteId=ath-self"),
      "ath-self"
    );
    expect(result).toEqual({ athleteId: "ath-self" });
  });

  it("rejects coachId that disagrees with the authenticated session", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("coach");
    const result = await resolveIntegrationCoach(
      authedRequest("coach-self", "/api/v1/integrations?coachId=coach-other"),
      "coach-other"
    );
    expect(result).toEqual({ error: "coach_mismatch", status: 403 });
  });

  it("does not allow a missing session to fall back to a client param", async () => {
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

describe("verifyQStashJob", () => {
  const prevSecret = process.env.INTEGRATION_AUTH_SECRET;
  const prevQstash = process.env.QSTASH_TOKEN;

  afterEach(() => {
    process.env.INTEGRATION_AUTH_SECRET = prevSecret;
    process.env.QSTASH_TOKEN = prevQstash;
  });

  it("denies unsigned jobs", () => {
    delete process.env.INTEGRATION_AUTH_SECRET;
    expect(verifyQStashJob(new Request("http://localhost/api/v1/jobs/strava-sync"))).toBe(false);
  });

  it("does not trust an upstash-signature header without the job secret", () => {
    process.env.QSTASH_TOKEN = "qstash-token";
    delete process.env.INTEGRATION_AUTH_SECRET;
    expect(
      verifyQStashJob(
        new Request("http://localhost/api/v1/jobs/strava-sync", {
          headers: { "upstash-signature": "forged" }
        })
      )
    ).toBe(false);
  });

  it("accepts the forwarded job secret", () => {
    process.env.INTEGRATION_AUTH_SECRET = "job-secret";
    expect(
      verifyQStashJob(
        new Request("http://localhost/api/v1/jobs/strava-sync", {
          headers: { authorization: "Bearer job-secret" }
        })
      )
    ).toBe(true);
  });
});
