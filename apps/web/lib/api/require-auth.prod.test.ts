import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireCoachId, requireAthleteId, requireAuth } from "./require-auth";
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

describe("require-auth production IDOR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("binds coach id to the authenticated coach, not the query param", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("coach");
    const result = await requireCoachId(
      authedRequest("coach-self", "/api/v1/roster?coachId=coach-other"),
      "coach-other"
    );
    expect("ok" in result && result.ok === false).toBe(true);
    if ("ok" in result && result.ok === false) {
      expect(result.response.status).toBe(403);
    }
  });

  it("returns the authenticated coach when no param is supplied", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("coach");
    const result = await requireCoachId(authedRequest("coach-self", "/api/v1/roster"));
    expect("coachId" in result).toBe(true);
    if ("coachId" in result) {
      expect(result.coachId).toBe("coach-self");
    }
  });

  it("allows admin to target another coach", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("admin");
    const result = await requireCoachId(
      authedRequest("admin-1", "/api/v1/roster?coachId=coach-other"),
      "coach-other"
    );
    expect("coachId" in result).toBe(true);
    if ("coachId" in result) {
      expect(result.coachId).toBe("coach-other");
    }
  });

  it("rejects athletes targeting another athlete", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    const result = await requireAthleteId(
      authedRequest("ath-self", "/api/v1/sessions?athleteId=ath-other"),
      "ath-other"
    );
    expect("ok" in result && result.ok === false).toBe(true);
    if ("ok" in result && result.ok === false) {
      expect(result.response.status).toBe(403);
    }
  });

  it("rejects missing Firebase token", async () => {
    const result = await requireAuth(new Request("http://localhost/api/v1/identity/profile"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });
});
