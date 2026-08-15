# Deletion audit

**Date:** 2026-08-15

No files were deleted in Phase 16.

Candidates inspected and **kept** (still referenced or frozen on purpose):

| Path | Why kept |
|------|----------|
| `apps/mobile` (Expo) | Frozen Path A; not proven unused |
| `components/ui-glass/**` | Still imported by Stitch web screens |
| `android/wear` F0 comments | Module now has operational LOCAL_DEMO UI |
| Maestro YAML | Referenced by docs; not executed (no device) |
| `qa/reports/**` | Historical evidence; do not delete |
| Duplicate launcher mipmaps | Lint warnings only — still used by adaptive icons |

Do not delete on “looks old.”
