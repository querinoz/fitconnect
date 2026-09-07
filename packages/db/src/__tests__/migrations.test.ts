import { describe, expect, it, beforeAll, afterAll, beforeEach } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cleanDb,
  createTestPrisma,
  executeSqlScript,
  runMigrateDeploy,
  seedMinimal
} from "../test-utils/db-factory";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const hasDocker = process.env.CI === "true" || process.env.RUN_DB_TESTS === "1";
/**
 * On GitHub Actions the workflow already starts Postgres + migrate deploy.
 * Prefer that URL so we do not nest Testcontainers inside the job.
 * Locally, ignore a stale DATABASE_URL and use Testcontainers when RUN_DB_TESTS=1.
 */
const externalDatabaseUrl =
  process.env.CI === "true" ? process.env.DATABASE_URL?.trim() || "" : "";

describe.skipIf(!hasDocker)("Prisma migrations", () => {
  let container: StartedPostgreSqlContainer | undefined;
  let prisma: PrismaClient;
  let databaseUrl: string;

  beforeAll(async () => {
    if (externalDatabaseUrl) {
      databaseUrl = externalDatabaseUrl;
      // Idempotent — CI already ran migrate deploy against this URL.
      runMigrateDeploy(databaseUrl);
      prisma = createTestPrisma(databaseUrl);
      return;
    }

    container = await new PostgreSqlContainer("postgres:15-alpine")
      .withDatabase("fitconnect_test")
      .withUsername("fitconnect")
      .withPassword("fitconnect_test")
      .withStartupTimeout(60_000)
      .start();
    databaseUrl = container.getConnectionUri();
    runMigrateDeploy(databaseUrl);
    prisma = createTestPrisma(databaseUrl);
  }, 120_000);

  afterAll(async () => {
    // Restore schema if a down.sql test dropped tables (shared CI DATABASE_URL).
    if (databaseUrl) {
      try {
        runMigrateDeploy(databaseUrl);
      } catch {
        /* best-effort restore for subsequent CI steps */
      }
    }
    await prisma?.$disconnect();
    await container?.stop();
  });

  beforeEach(async () => {
    await cleanDb(prisma);
  });

  it("should_apply_migrate_deploy_on_clean_db", async () => {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const names = tables.map((t) => t.tablename);
    expect(names).toContain("Session");
    expect(names).toContain("ProcessedStripeEvent");
    expect(names).toContain("UserSubscription");
  });

  it("should_preserve_data_when_migrate_deploy_runs_with_existing_rows", async () => {
    await seedMinimal(prisma);
    const before = await prisma.athleteProfile.count();
    expect(before).toBe(1);

    runMigrateDeploy(databaseUrl);
    const after = await prisma.athleteProfile.count();
    expect(after).toBe(1);
  });

  it("should_be_idempotent_on_second_migrate_deploy", () => {
    expect(() => runMigrateDeploy(databaseUrl)).not.toThrow();
    expect(() => runMigrateDeploy(databaseUrl)).not.toThrow();
  });

  it("should_have_critical_indexes_on_session_and_readiness", async () => {
    const indexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
    `;
    const names = indexes.map((i) => i.indexname);
    expect(names.some((n) => n.includes("Session") && n.includes("athleteExternalId"))).toBe(true);
    expect(names.some((n) => n.includes("Session") && n.includes("scheduledAt"))).toBe(true);
    expect(names.some((n) => n.includes("ReadinessSnapshot") && n.includes("athleteExternalId"))).toBe(
      true
    );
  });

  it("should_restore_previous_state_via_versioned_down_sql", async () => {
    await seedMinimal(prisma);
    const downSql = readFileSync(
      path.join(REPO_ROOT, "prisma/migrations/20260907140000_init/down.sql"),
      "utf8"
    );
    await executeSqlScript(prisma, downSql);

    const stripeTable = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE tablename = 'ProcessedStripeEvent'
    `;
    expect(stripeTable).toHaveLength(0);
  });
});
