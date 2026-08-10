import { describe, expect, it } from "vitest";
import { isDemoMode } from "@/lib/auth/supabase/client";

describe("require-auth demo mode", () => {
  it("treats unset DEMO_MODE as demo off (fail-closed)", () => {
    const prev = process.env.NEXT_PUBLIC_DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    expect(isDemoMode()).toBe(false);
    process.env.NEXT_PUBLIC_DEMO_MODE = prev;
  });

  it("respects explicit true", () => {
    const prev = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    expect(isDemoMode()).toBe(true);
    process.env.NEXT_PUBLIC_DEMO_MODE = prev;
  });

  it("respects explicit false", () => {
    const prev = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    expect(isDemoMode()).toBe(false);
    process.env.NEXT_PUBLIC_DEMO_MODE = prev;
  });
});
