import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Elite OS tokens (elite-os.css)", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/elite-os.css"),
    "utf8"
  );

  it.each([
    ["--eos-floor", "#070b14"],
    ["--ink-900", "#0b0f19"],
    ["--eos-voltline", "#c8ff00"],
    ["--volt-400", "#d0ff33"],
    ["--nivis-lime", "var\\(--eos-voltline\\)"],
    ["--connect-500", "#00ddb4"],
    ["--crimson-500", "#ff3a5c"],
    ["--glass-md", "rgba\\(255,\\s*255,\\s*255,\\s*0.06\\)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected}`);
    expect(re.test(css)).toBe(true);
  });
});
