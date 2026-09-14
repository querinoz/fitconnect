import { describe, expect, it } from "vitest";
import { getPgPool } from "./pg-pool";
import { isDatabaseConfigured } from "./client";

describe("pg pool docker-host refusal", () => {
  it("does not construct a Pool for hostname base", () => {
    const prev = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgres://user:pass@base:5432/postgres";
    try {
      expect(isDatabaseConfigured()).toBe(false);
      expect(getPgPool()).toBeNull();
    } finally {
      if (prev === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = prev;
    }
  });
});
