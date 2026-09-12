import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function source(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

describe("marketing landing runtime isolation", () => {
  it("does not statically import Firebase, Convex, or PostHog from providers", () => {
    const text = source("components/providers.tsx");
    expect(text).not.toMatch(/from ["']firebase/);
    expect(text).not.toMatch(/from ["']convex/);
    expect(text).not.toMatch(/from ["']posthog-js/);
    expect(text).toMatch(/dynamic\(/);
    expect(text).toMatch(/pathname === ["']\/["']/);
  });

  it("does not statically import the Firebase Auth SDK from AuthStoreProvider", () => {
    const text = source("components/auth-store-provider.tsx");
    expect(text).not.toMatch(/from ["']firebase/);
    expect(text).not.toMatch(/use-supabase-auth-sync/);
    expect(text).toMatch(/auth-backend/);
    expect(text).toMatch(/dynamic\(/);
  });

  it("keeps authBackend free of the Firebase SDK", () => {
    const text = source("lib/auth/auth-backend.ts");
    expect(text).not.toMatch(/from ["']firebase/);
    expect(text).toMatch(/isFirebaseWebConfigured/);
  });

  it("exports static metadata so tags land in <head>", () => {
    const text = source("app/layout.tsx");
    expect(text).toMatch(/export const metadata/);
    expect(text).not.toMatch(/export async function generateMetadata/);
    expect(text).not.toMatch(/getServerLang/);
  });
});
