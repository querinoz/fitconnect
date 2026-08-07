//! Browser binding for elite-core (wasm-bindgen).
//!
//! F0 status: skeleton — proves the crate builds for `wasm32-unknown-unknown`
//! and exports a callable JS function. Consumed by the thin TS wrapper
//! package `packages/elite-core-wasm` (not yet created — F1/F12 work,
//! browser is a hard requirement per ADR-006 because F12 dashboards do
//! client-side analysis).

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn version() -> String {
    elite_core::version().to_string()
}
