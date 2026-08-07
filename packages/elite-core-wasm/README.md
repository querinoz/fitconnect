# @fitconnect/elite-core-wasm

Thin TypeScript wrapper around the browser (wasm-bindgen) build of **Elite Core**,
the Rust crate that owns all sports metrics/physiology math
([ADR-006](../../docs/adr/ADR-006-elite-core-rust.md)).

## Build flow

```
elite-core/wasm (Rust, wasm-bindgen)
        │  wasm-pack build elite-core/wasm --out-dir ../../packages/elite-core-wasm/pkg
        ▼
pkg/  (generated JS glue + .wasm — gitignored, built in F1)
        ▼
src/index.ts  (this wrapper: loadEliteCore(): Promise<EliteCore>)
        ▼
apps/web  (client-side analysis dashboards, F12)
```

## Usage

```ts
import { loadEliteCore } from "@fitconnect/elite-core-wasm";

const core = await loadEliteCore();
core.version(); // e.g. "0.1.0"
```

Until `pkg/` is built, `loadEliteCore()` rejects with
`elite-core wasm artifact not built — run pnpm core:wasm`.
