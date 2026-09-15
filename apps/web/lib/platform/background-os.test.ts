import { describe, expect, it } from "vitest";
import {
  BACKGROUND_CATALOG,
  KEEP_ENTIRE_APP_ALIVE,
  webCanRunInBackground,
} from "./background-os";

describe("background-os", () => {
  it("does not keep the web app alive forever", () => {
    expect(KEEP_ENTIRE_APP_ALIVE).toBe(false);
    expect(BACKGROUND_CATALOG.length).toBeGreaterThan(0);
  });

  it("classifies TRAIN as a foreground session and Feed as not needed", () => {
    expect(webCanRunInBackground("TRAIN / Fight Mode")).toBe(true);
    expect(webCanRunInBackground("Feed / Zenith / MCP")).toBe(false);
  });
});
