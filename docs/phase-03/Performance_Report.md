# Phase 03 — Performance Report

## Design choices

| Pattern | Implementation |
|---------|----------------|
| List virtualization | `LazyColumn` in `EliteLazyList` |
| Stable keys | Required `key: (T) -> Any` |
| Skeletons | Lightweight boxes — no heavy shimmer lib |
| Charts | Single `Canvas` path — no per-point composables |
| Theme | CompositionLocals — no recomposition from hex parsing |
| Images | Still `ImageLoader` port in foundation (Coil later) |

## Not measured on device

60fps claims for shared-element / page transitions require emulator/device profiling — **blocked** (BIOS SVM). Catalog compiles and unit tests pass; frame timing TBD.
