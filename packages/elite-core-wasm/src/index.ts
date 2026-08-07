/**
 * Thin TypeScript wrapper around the wasm-bindgen output of the Rust crate
 * `elite-core/wasm` (see docs/adr/ADR-006-elite-core-rust.md).
 *
 * The wasm artifact lands in `pkg/` via
 * `wasm-pack build elite-core/wasm --out-dir ../../packages/elite-core-wasm/pkg`.
 * Until it is built (F1), `loadEliteCore()` rejects with a clear error.
 */

export interface EliteCore {
  version(): string;
}

// Assembled at runtime so TypeScript and bundlers don't try to statically
// resolve pkg/ (which does not exist until `pnpm core:wasm` runs).
const WASM_ENTRY = ["..", "pkg", "elite_core_wasm.js"].join("/");

export async function loadEliteCore(): Promise<EliteCore> {
  let mod: { version(): string };
  try {
    mod = await import(/* @vite-ignore */ /* webpackIgnore: true */ WASM_ENTRY);
  } catch (cause) {
    throw new Error(
      "elite-core wasm artifact not built — run pnpm core:wasm",
      { cause }
    );
  }
  return {
    version: () => mod.version(),
  };
}
