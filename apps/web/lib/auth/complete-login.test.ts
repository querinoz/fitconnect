import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/demo-session";
import { persistClientAuthSession } from "@/lib/auth/complete-login";

describe("persistClientAuthSession", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, registered: [] });
    document.cookie = `${DEMO_SESSION_COOKIE}=; Path=/; Max-Age=0`;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets zustand user and demo cookie for built-in demo ids", () => {
    persistClientAuthSession({
      id: "athlete",
      username: "Athlete",
      name: "Inês M.",
      email: "ines@fitconnect.local",
      role: "athlete",
      athleteId: "a-ines"
    });

    expect(useAuthStore.getState().user?.role).toBe("athlete");
    expect(document.cookie).toContain(`${DEMO_SESSION_COOKIE}=athlete`);
  });

  it("clears demo cookie for supabase-only sessions", () => {
    document.cookie = `${DEMO_SESSION_COOKIE}=athlete; Path=/`;

    persistClientAuthSession(
      {
        id: "supabase-uuid",
        username: "ines@fitconnect.local",
        name: "Inês",
        email: "ines@fitconnect.local",
        role: "athlete"
      },
      { persistDemoCookie: false }
    );

    expect(document.cookie).not.toContain(`${DEMO_SESSION_COOKIE}=athlete`);
  });
});
