import { afterEach } from "vitest";
import { parseFirebaseIdToken } from "@/lib/auth/firebase-id-token";
import { __setFirebaseTokenVerifierForTests } from "@/lib/auth/firebase-verify";

/**
 * Node-safe setup for integration tests (environment: "node").
 * Do not touch `window` / jsdom APIs here — that belongs in vitest.setup.ts.
 */
__setFirebaseTokenVerifierForTests(async (token) => parseFirebaseIdToken(token));

afterEach(() => {
  // Integration suites that mutate env should restore in their own hooks.
});
