import { describe, expect, it } from "vitest";
import { loadEliteCore } from "./index";

describe("loadEliteCore (F0: pkg/ not built yet)", () => {
  it("rejects with a clear error when the wasm artifact is absent", async () => {
    await expect(loadEliteCore()).rejects.toThrow(
      "elite-core wasm artifact not built — run pnpm core:wasm"
    );
  });
});
