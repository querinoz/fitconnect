import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");

const FILES = [
  "app/(marketing)/ios/page.tsx",
  "app/(marketing)/ios/install/route.ts",
  "components/ios-install/ios-install-page.tsx",
  "components/ios-install/install-button.tsx",
  "lib/ios-install/config.ts",
  "lib/ios-install/allowlist.ts"
];

const FORBIDDEN = [
  "BEGIN PRIVATE KEY",
  "STRIPE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTHKEY_",
  "-----BEGIN"
];

describe("iOS hub source does not embed secrets", () => {
  it("keeps private keys and live join codes out of the hub files", () => {
    for (const rel of FILES) {
      const text = readFileSync(join(root, rel), "utf8");
      for (const needle of FORBIDDEN) {
        expect(text.includes(needle), `${rel} contains ${needle}`).toBe(false);
      }
      expect(text).not.toMatch(/testflight\.apple\.com\/join\/[A-Za-z0-9]{6,}/);
    }
  });
});
