import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const adminDir = join(dirname(fileURLToPath(import.meta.url)), "../../app/admin");

const PAGES = [
  "athletes/page.tsx",
  "page.tsx",
  "payments/page.tsx",
  "analytics/page.tsx",
  "layout.tsx"
];

describe("admin production build boundary", () => {
  it("keeps every Postgres admin route force-dynamic so /admin/athletes cannot SSG against host base", () => {
    for (const rel of PAGES) {
      const src = readFileSync(join(adminDir, rel), "utf8");
      expect(src, rel).toMatch(/export const dynamic = "force-dynamic"/);
      expect(src, rel).not.toMatch(/^["']use client["']/m);
    }
    const athletes = readFileSync(join(adminDir, "athletes/page.tsx"), "utf8");
    expect(athletes).toMatch(/loadAdminAthletes/);
  });
});
