import { validateCredentials, createDemoUserFromSignup } from "@/lib/auth";
import { describe, it, expect } from "vitest";

describe("auth", () => {
  it("accepts valid credentials", () => {
    const user = validateCredentials("Admin", "Admin");
    expect(user?.username).toBe("Admin");
  });

  it("rejects wrong password", () => {
    expect(validateCredentials("Admin", "wrong")).toBeNull();
  });

  it("accepts registered demo users", () => {
    const cred = createDemoUserFromSignup({
      name: "Test User",
      email: "test@fitconnect.local",
      password: "password123",
      role: "athlete"
    });
    const user = validateCredentials("test@fitconnect.local", "password123", [cred]);
    expect(user?.email).toBe("test@fitconnect.local");
  });
});