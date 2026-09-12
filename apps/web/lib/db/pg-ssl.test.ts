import { describe, expect, it } from "vitest";
import { postgresSslOption } from "./pg-ssl";

describe("postgresSslOption", () => {
  it("disables TLS for loopback Postgres", () => {
    expect(postgresSslOption("postgresql://u:p@localhost:5433/db")).toBe(false);
    expect(postgresSslOption("postgresql://u:p@127.0.0.1:5432/db")).toBe(false);
  });

  it("verifies certificates for non-Supabase remotes", () => {
    expect(
      postgresSslOption("postgresql://u:p@db.example.com:5432/postgres")
    ).toEqual({ rejectUnauthorized: true });
  });

  it("keeps TLS on for Supabase but cannot pin their current CA", () => {
    const opt = postgresSslOption(
      "postgresql://u:p@db.abcd.supabase.co:5432/postgres"
    );
    expect(opt).not.toBe(false);
    expect((opt as { rejectUnauthorized: boolean }).rejectUnauthorized).toBe(
      false
    );
  });
});
