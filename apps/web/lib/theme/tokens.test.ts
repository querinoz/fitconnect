import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("voltline tokens", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/voltline.css"),
    "utf8"
  );

  it.each([
    ["--ink-950", "#07080b"],
    ["--ink-900", "#0c0d11"],
    ["--volt-500", "#c8ff00"],
    ["--volt-400", "#d6ff33"],
    ["--connect-500", "#00ddb4"],
    ["--crimson-500", "#ff3a5c"],
    ["--glass-md", "rgba(255,255,255,.06)"],
    ["--glass-edge", "rgba(200,255,0,.30)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    expect(re.test(css)).toBe(true);
  });
});
