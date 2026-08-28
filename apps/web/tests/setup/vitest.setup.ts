import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { parseFirebaseIdToken } from "@/lib/auth/firebase-id-token";
import { __setFirebaseTokenVerifierForTests } from "@/lib/auth/firebase-verify";

// Unit tests exercise authorization logic (IDOR, role binding), not Google's
// RS256 signature check, and must not reach the network for JWKS. Install the
// decode-only verifier for the suite. The real signature path is covered by
// lib/auth/firebase-verify.test.ts, which does not use this seam.
__setFirebaseTokenVerifierForTests(async (token) => parseFirebaseIdToken(token));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

// Mock localStorage
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  },
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: (index: number) => Object.keys(localStorageStore)[index] || null
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true
});

afterEach(() => {
  localStorage.clear();
  cleanup();
});
