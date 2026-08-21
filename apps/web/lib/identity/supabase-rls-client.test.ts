import { describe, expect, it } from "vitest";
import { createSupabaseRlsClient } from "./supabase-rls-client";

describe("createSupabaseRlsClient", () => {
  it("never builds a client without URL, anon key, and access token", () => {
    expect(createSupabaseRlsClient("token", {})).toBeNull();
    expect(
      createSupabaseRlsClient("", {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
      })
    ).toBeNull();
  });
});
