import { validateCredentials } from "@/lib/auth";
import { describe, it, expect } from "vitest";

describe("auth", () => {
  it("accepts valid credentials", () => {
    const user = validateCredentials("Admin", "Admin");
    expect(user?.username).toBe("Admin");
  });

  it("rejects wrong password", () => {
    expect(validateCredentials("Admin", "wrong")).toBeNull();
  });
});