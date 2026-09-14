import { afterEach, describe, expect, it } from "vitest";
import {
  hostnameFromConnectionString,
  isDockerOnlyHostname,
  isRuntimeSafeDatabaseUrl
} from "./runtime-hosts";

describe("runtime-hosts", () => {
  afterEach(() => {
    delete process.env.FITCONNECT_ALLOW_DOCKER_DB;
  });

  it("parses postgres URLs and libpq host= values", () => {
    expect(hostnameFromConnectionString("postgres://user:pass@base:5432/postgres")).toBe("base");
    expect(hostnameFromConnectionString("postgresql://x@db.example.supabase.co:5432/postgres")).toBe(
      "db.example.supabase.co"
    );
    expect(hostnameFromConnectionString("host=base port=5432")).toBe("base");
    expect(hostnameFromConnectionString("base")).toBe("base");
  });

  it("rejects exact docker compose hosts, not substrings of public hostnames", () => {
    expect(isDockerOnlyHostname("base")).toBe(true);
    expect(isDockerOnlyHostname("db")).toBe(true);
    expect(isDockerOnlyHostname("database.supabase.co")).toBe(false);
    expect(isDockerOnlyHostname("my-redis.upstash.io")).toBe(false);
    expect(isDockerOnlyHostname("localhost")).toBe(false);
  });

  it("treats docker-only DATABASE_URL as unusable unless explicitly allowed", () => {
    expect(isRuntimeSafeDatabaseUrl("postgres://u:p@base:5432/postgres")).toBe(false);
    expect(isRuntimeSafeDatabaseUrl("postgres://u:p@db:5432/postgres")).toBe(false);
    expect(isRuntimeSafeDatabaseUrl("postgres://u:p@aws-0-eu-west-1.pooler.supabase.com:6543/postgres")).toBe(
      true
    );
    expect(isRuntimeSafeDatabaseUrl("")).toBe(false);
    expect(isRuntimeSafeDatabaseUrl("PASTE_YOUR_DATABASE_URL")).toBe(false);
    process.env.FITCONNECT_ALLOW_DOCKER_DB = "1";
    expect(isRuntimeSafeDatabaseUrl("postgres://u:p@base:5432/postgres")).toBe(true);
  });
});
