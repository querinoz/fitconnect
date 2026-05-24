import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("security headers integration", () => {
  it("should_include_required_security_headers_on_health_route", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});
