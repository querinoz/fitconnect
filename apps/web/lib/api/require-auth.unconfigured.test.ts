import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireAuth, requireAthleteId } from "./require-auth";

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => false
}));

vi.mock("@/lib/firebase/config", () => ({
  isFirebaseWebConfigured: () => false
}));

vi.mock("@/lib/identity/repository", () => ({
  lookupIdentityRole: vi.fn()
}));

describe("require-auth DEMO_MODE=false + Firebase missing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 auth_not_configured instead of opening a demo user", async () => {
    const result = await requireAuth(new Request("http://localhost/api/v1/identity/profile"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(503);
      const body = await result.response.json();
      expect(body.error).toBe("auth_not_configured");
    }
  });

  it("does not bind athleteId to a-ines or first-user fallback", async () => {
    const result = await requireAthleteId(
      new Request("http://localhost/api/v1/sessions?athleteId=a-ines"),
      "a-ines"
    );
    expect("ok" in result && result.ok === false).toBe(true);
    if ("ok" in result && result.ok === false) {
      expect(result.response.status).toBe(503);
    }
  });
});
