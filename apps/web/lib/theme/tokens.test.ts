import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("voltline tokens", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/voltline.css"),
    "utf8"
  );

  it.each([
    ["--ink-950", "#090402"],
    ["--ink-900", "#0c0a08"],
    ["--volt-500", "#bfee16"],
    ["--volt-400", "#c9f622"],
    ["--nivis-lime", "#bfee16"],
    ["--connect-500", "#00ddb4"],
    ["--crimson-500", "#ff3a5c"],
    ["--glass-md", "rgba(255,255,255,.06)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    expect(re.test(css)).toBe(true);
  });
});
