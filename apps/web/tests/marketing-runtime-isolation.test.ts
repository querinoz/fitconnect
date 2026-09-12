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

  it("keeps below-fold landing modules out of the static hero import graph", () => {
    const hero = source("components/landing/landing-page-content.tsx");
    expect(hero).not.toMatch(/from ["']@\/components\/pricing/);
    expect(hero).not.toMatch(/from ["']@\/components\/landing\/cinematic-break/);
    expect(hero).toMatch(/below-fold-after-hero/);
    const i18n = source("lib/i18n/index.ts");
    expect(i18n).not.toMatch(/from ["']\.\/locales\/es["']/);
    expect(i18n).not.toMatch(/from ["']\.\/locales\/fr["']/);
    expect(i18n).toMatch(/import\("\.\/locales\/es"\)/);
    const heroOs = source("components/marketing/landing-v2/hero-elite-os.tsx");
    expect(heroOs).not.toMatch(/from ["']@\/lib\/motion\/gsap-register/);
    expect(heroOs).toMatch(/prefetch=\{false\}/);
    const nav = source("components/landing/landing-os-nav.tsx");
    expect(nav).toMatch(/prefetch=\{false\}/);
    const lenis = source("lib/motion/lenis-provider.tsx");
    expect(lenis).not.toMatch(/from ["']lenis["']/);
    expect(lenis).toMatch(/import\("lenis"\)/);
  });

  it("exports static metadata so tags land in <head>", () => {
    const text = source("app/layout.tsx");
    expect(text).toMatch(/export const metadata/);
    expect(text).not.toMatch(/export async function generateMetadata/);
    expect(text).not.toMatch(/getServerLang/);
  });
});
