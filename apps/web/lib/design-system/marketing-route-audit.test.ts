import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = join(process.cwd());
const MARKETING_ROOT = join(WEB_ROOT, "app/(marketing)");

const FORBIDDEN_PATTERNS = [
  /from ["']@\/components\/nav["']/,
  /from ["']@\/components\/footer["']/,
  /from ["']@\/components\/demo-banner["']/,
  /<Nav[\s/>]/,
  /<Footer[\s/>]/,
  /<DemoBanner[\s/>]/
];

function collectPageFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectPageFiles(full));
      continue;
    }
    if (entry === "page.tsx" || entry.endsWith("-content.tsx")) {
      files.push(full);
    }
  }

  return files;
}

describe("marketing route audit", () => {
  it("marketing pages do not duplicate MarketingShell chrome", () => {
    const files = collectPageFiles(MARKETING_ROOT);
    expect(files.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${file.replace(WEB_ROOT, "")} → ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("covers onboarding and mobile routes under (marketing)", () => {
    const files = collectPageFiles(MARKETING_ROOT).map((f) =>
      f.replace(WEB_ROOT, "").replace(/\\/g, "/")
    );

    expect(files).toContain("/app/(marketing)/mobile/page.tsx");
    expect(files).toContain("/app/(marketing)/onboarding/athlete/page.tsx");
    expect(files).toContain("/app/(marketing)/onboarding/coach/page.tsx");
    expect(files).toContain("/app/(marketing)/community/page.tsx");
    expect(files).toContain("/app/(marketing)/programs/page.tsx");
  });
});
