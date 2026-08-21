import { describe, expect, it, vi } from "vitest";
import { bootstrapIdentityProfile } from "./repository";

vi.mock("./supabase-rls-client", () => ({
  createSupabaseRlsClient: () => null
}));

describe("identity repository fail-closed", () => {
  it("does not bypass RLS when the Data API is unconfigured", async () => {
    const result = await bootstrapIdentityProfile({
      uid: "user-a",
      accessToken: "token"
    });
    expect(result.status).toBe(503);
    expect(result.error).toBe("data_api_not_configured");
    expect(result.profile).toBeNull();
  });
});
