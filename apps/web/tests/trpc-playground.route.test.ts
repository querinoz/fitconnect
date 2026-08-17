import { beforeEach, describe, expect, it, vi } from "vitest";

const isDemoMode = vi.fn(() => false);

vi.mock("@/lib/auth/supabase/client", () => ({
  isDemoMode: () => isDemoMode()
}));

describe("tRPC playground route", () => {
  beforeEach(() => {
    isDemoMode.mockReturnValue(false);
    vi.resetModules();
  });

  it("returns 404 when demo mode is off", async () => {
    const { GET } = await import("@/app/api/trpc-playground/route");
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns playground payload when demo mode is on", async () => {
    isDemoMode.mockReturnValue(true);
    const { GET } = await import("@/app/api/trpc-playground/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.playground).toBe(true);
  });
});
