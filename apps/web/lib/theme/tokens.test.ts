import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Elite OS tokens (voltline.css)", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/voltline.css"),
    "utf8"
  );

  it.each([
    ["--ink-950", "#070b14"],
    ["--ink-900", "#0b0f19"],
    ["--volt-500", "#c8ff00"],
    ["--volt-400", "#d0ff33"],
    ["--nivis-lime", "#c8ff00"],
    ["--connect-500", "#00ddb4"],
    ["--crimson-500", "#ff3a5c"],
    ["--glass-md", "rgba(255,255,255,.06)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    expect(re.test(css)).toBe(true);
  });
});
