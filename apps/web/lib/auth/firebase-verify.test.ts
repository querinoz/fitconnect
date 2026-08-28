import { beforeEach, afterAll, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import {
  verifyFirebaseIdToken,
  __setFirebaseTokenVerifierForTests,
  __resetFirebaseKeyCacheForTests
} from "./firebase-verify";

// The global vitest setup installs a decode-only verifier so that authorization
// tests need no network. This file tests the REAL signature path, so it removes
// that seam and restores it afterwards.
import { parseFirebaseIdToken } from "./firebase-id-token";

const PROJECT_ID = "fitconnect-test";
const KID = "test-key-1";

vi.stubGlobal("crypto", webcrypto);

function b64u(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function makeKeyPair() {
  return webcrypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );
}

async function sign(privateKey: CryptoKey, header: object, payload: object): Promise<string> {
  const signingInput = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  const signature = new Uint8Array(
    await webcrypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      privateKey,
      new TextEncoder().encode(signingInput)
    )
  );
  return `${signingInput}.${b64u(signature)}`;
}

function validClaims(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    sub: "victim-uid",
    email: "victim@fitconnect.app",
    iat: now - 10,
    auth_time: now - 10,
    exp: now + 3600,
    ...overrides
  };
}

/** Serve the public half of `keyPair` as Google's JWKS would. */
async function stubJwks(publicKey: CryptoKey, kid = KID) {
  const jwk = await webcrypto.subtle.exportKey("jwk", publicKey);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ keys: [{ ...jwk, kid, alg: "RS256", use: "sig" }] }), {
        status: 200,
        headers: { "cache-control": "public, max-age=3600" }
      })
    )
  );
}

let keyPair: CryptoKeyPair;

beforeEach(async () => {
  __setFirebaseTokenVerifierForTests(null);
  __resetFirebaseKeyCacheForTests();
  keyPair = (await makeKeyPair()) as CryptoKeyPair;
  await stubJwks(keyPair.publicKey);
});

afterAll(() => {
  // Restore the suite-wide seam for any file that runs after this one.
  __setFirebaseTokenVerifierForTests(async (token) => parseFirebaseIdToken(token));
});

describe("verifyFirebaseIdToken", () => {
  it("accepts a token signed by the published Firebase key", async () => {
    const token = await sign(keyPair.privateKey, { alg: "RS256", kid: KID, typ: "JWT" }, validClaims());
    const claims = await verifyFirebaseIdToken(token, { projectId: PROJECT_ID });
    expect(claims?.sub).toBe("victim-uid");
    expect(claims?.email).toBe("victim@fitconnect.app");
  });

  // This is the P0 regression: the pre-fix decoder accepted exactly this token.
  it("rejects an unsigned alg:none token impersonating a real uid", async () => {
    const header = b64u(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payload = b64u(JSON.stringify(validClaims()));
    const forged = `${header}.${payload}.anything`;
    expect(await verifyFirebaseIdToken(forged, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects a token signed by a key Google did not publish", async () => {
    const attackerKeys = (await makeKeyPair()) as CryptoKeyPair;
    const token = await sign(
      attackerKeys.privateKey,
      { alg: "RS256", kid: KID, typ: "JWT" },
      validClaims()
    );
    expect(await verifyFirebaseIdToken(token, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects a token whose payload was swapped after signing", async () => {
    const token = await sign(keyPair.privateKey, { alg: "RS256", kid: KID, typ: "JWT" }, validClaims());
    const [header, , signature] = token.split(".");
    const swapped = `${header}.${b64u(JSON.stringify(validClaims({ sub: "other-uid" })))}.${signature}`;
    expect(await verifyFirebaseIdToken(swapped, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects an unknown key id", async () => {
    const token = await sign(
      keyPair.privateKey,
      { alg: "RS256", kid: "rotated-away", typ: "JWT" },
      validClaims()
    );
    expect(await verifyFirebaseIdToken(token, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects another project's audience and issuer", async () => {
    const wrongAud = await sign(
      keyPair.privateKey,
      { alg: "RS256", kid: KID, typ: "JWT" },
      validClaims({ aud: "someone-elses-project" })
    );
    expect(await verifyFirebaseIdToken(wrongAud, { projectId: PROJECT_ID })).toBeNull();

    const wrongIss = await sign(
      keyPair.privateKey,
      { alg: "RS256", kid: KID, typ: "JWT" },
      validClaims({ iss: "https://securetoken.google.com/someone-elses-project" })
    );
    expect(await verifyFirebaseIdToken(wrongIss, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects an expired token", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await sign(
      keyPair.privateKey,
      { alg: "RS256", kid: KID, typ: "JWT" },
      validClaims({ exp: now - 3600, iat: now - 7200, auth_time: now - 7200 })
    );
    expect(await verifyFirebaseIdToken(token, { projectId: PROJECT_ID })).toBeNull();
  });

  it("fails closed when no project id is configured", async () => {
    const token = await sign(keyPair.privateKey, { alg: "RS256", kid: KID, typ: "JWT" }, validClaims());
    expect(await verifyFirebaseIdToken(token, { projectId: null })).toBeNull();
  });

  it("returns null instead of throwing when the JWKS endpoint fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })));
    __resetFirebaseKeyCacheForTests();
    const token = await sign(keyPair.privateKey, { alg: "RS256", kid: KID, typ: "JWT" }, validClaims());
    expect(await verifyFirebaseIdToken(token, { projectId: PROJECT_ID })).toBeNull();
  });

  it("rejects malformed input", async () => {
    expect(await verifyFirebaseIdToken(null, { projectId: PROJECT_ID })).toBeNull();
    expect(await verifyFirebaseIdToken("", { projectId: PROJECT_ID })).toBeNull();
    expect(await verifyFirebaseIdToken("not-a-jwt", { projectId: PROJECT_ID })).toBeNull();
  });
});
