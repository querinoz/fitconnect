import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("voltline tokens", () => {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "app/voltline.css"),
    "utf8"
  );

  it.each([
    ["--ink-950", "#07080A"],
    ["--ink-900", "#0E0F12"],
    ["--volt-500", "#C7FB3A"],
    ["--volt-400", "#DAFE7E"],
    ["--jade-500", "#2DD4BF"],
    ["--coral-500", "#FF5470"],
    ["--glass-md", "rgba(255,255,255,.06)"],
    ["--glass-edge", "rgba(199,251,58,.30)"],
  ])("defines %s as %s", (name, expected) => {
    const re = new RegExp(`${name}\\s*:\\s*${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    expect(re.test(css)).toBe(true);
  });
});
