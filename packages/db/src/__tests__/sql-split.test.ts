import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { splitSqlStatements } from "../test-utils/db-factory";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../..");

describe("splitSqlStatements", () => {
  it("strips UTF-8 BOM and splits multi-statement down.sql", () => {
    const downSql = readFileSync(
      path.join(REPO_ROOT, "prisma/migrations/20260907140000_init/down.sql"),
      "utf8"
    );
    const statements = splitSqlStatements(`\uFEFF${downSql}`);
    expect(statements).toHaveLength(5);
    expect(statements[0]).toMatch(/^DROP INDEX/i);
    expect(statements[4]).toMatch(/^DROP TABLE IF EXISTS "ProcessedStripeEvent"$/i);
  });
});
