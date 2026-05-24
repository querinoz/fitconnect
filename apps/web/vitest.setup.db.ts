import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.join(__dirname, ".vitest-db-env.json");
const REPO_ROOT = path.resolve(__dirname, "../..");

async function startWithRetry(maxAttempts = 3): Promise<StartedPostgreSqlContainer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await new PostgreSqlContainer("postgres:15-alpine")
        .withDatabase("fitconnect_test")
        .withUsername("fitconnect")
        .withPassword("fitconnect_test")
        .withStartupTimeout(60_000)
        .start();
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

export default async function globalSetup() {
  const container = await startWithRetry();
  const url = container.getConnectionUri();

  execSync("pnpm exec prisma migrate deploy", {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
    stdio: "pipe"
  });

  writeFileSync(ENV_FILE, JSON.stringify({ DATABASE_URL: url, DIRECT_URL: url }));

  return async () => {
    if (existsSync(ENV_FILE)) unlinkSync(ENV_FILE);
    await container.stop();
  };
}
