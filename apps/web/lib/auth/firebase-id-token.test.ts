import { describe, expect, it } from "vitest";
import { encodeUnsignedTestJwt, parseFirebaseIdToken } from "./firebase-id-token";

describe("parseFirebaseIdToken", () => {
  it("reads sub and email from a well-formed token", () => {
    const token = encodeUnsignedTestJwt({
      sub: "firebase-uid-1",
      email: "a@fitconnect.app",
      email_verified: true
    });
    const claims = parseFirebaseIdToken(token);
    expect(claims?.sub).toBe("firebase-uid-1");
    expect(claims?.email).toBe("a@fitconnect.app");
    expect(claims?.email_verified).toBe(true);
  });

  it("rejects expired tokens", () => {
    const token = encodeUnsignedTestJwt({
      sub: "firebase-uid-1",
      exp: Math.floor(Date.now() / 1000) - 10
    });
    expect(parseFirebaseIdToken(token)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(parseFirebaseIdToken("not-a-jwt")).toBeNull();
    expect(parseFirebaseIdToken("")).toBeNull();
  });
});
