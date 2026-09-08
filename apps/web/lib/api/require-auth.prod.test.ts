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

vi.mock("@/lib/identity/entitlements", async () => {
  const actual = await vi.importActual<typeof import("@/lib/identity/entitlements")>(
    "@/lib/identity/entitlements"
  );
  return {
    ...actual,
    listCapabilities: vi.fn(async () => [] as const),
    readPreferredActiveMode: vi.fn(async () => null)
  };
});

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

  it("rejects malformed bearer tokens", async () => {
    const result = await requireAuth(
      new Request("http://localhost/api/v1/identity/profile", {
        headers: { Authorization: "Bearer not-a-jwt" }
      })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });

  it("binds user.id to Firebase sub, not a local demo persona", async () => {
    vi.mocked(lookupIdentityRole).mockResolvedValue("athlete");
    const result = await requireAuth(authedRequest("firebase-uid-abc", "/api/v1/identity/profile"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user.id).toBe("firebase-uid-abc");
      expect(result.demo).toBe(false);
      expect(result.user.id).not.toBe("demo-user");
      expect(result.user.id).not.toMatch(/^a-ines/);
    }
  });
});
