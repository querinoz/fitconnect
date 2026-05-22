import { describe, expect, it } from "vitest";
import { mapSupabaseUserToAuthUser } from "./map-supabase-user";

describe("mapSupabaseUserToAuthUser", () => {
  it("maps athlete metadata", () => {
    const user = mapSupabaseUserToAuthUser({
      id: "uuid-1",
      email: "ines@fitconnect.com",
      user_metadata: { name: "Inês M.", role: "athlete" },
      app_metadata: {},
      aud: "authenticated",
      created_at: ""
    });

    expect(user.role).toBe("athlete");
    expect(user.name).toBe("Inês M.");
    expect(user.athleteId).toBe("a-ines");
  });

  it("maps coach metadata", () => {
    const user = mapSupabaseUserToAuthUser({
      id: "uuid-2",
      email: "coach@fitconnect.com",
      user_metadata: { name: "Tomás", role: "coach", coachId: "t-002" },
      app_metadata: {},
      aud: "authenticated",
      created_at: ""
    });

    expect(user.role).toBe("coach");
    expect(user.coachId).toBe("t-002");
  });
});
