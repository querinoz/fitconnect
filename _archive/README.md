# `_archive`

The Expo / React Native app (`apps/mobile`, later `_archive/apps-mobile-frozen-adr005`) was **removed from the working tree on 2026-09-08**.

- **Why:** ADR-005 — production mobile is native Android Compose (`android/`). iOS is SwiftUI (`iosApp/`). Keeping Expo in-tree duplicated the product surface.
- **Recover:** git history still has the tree (`git log -- _archive/apps-mobile-frozen-adr005` / `git checkout <commit> -- _archive/apps-mobile-frozen-adr005`).
- **Do not** recreate `apps/mobile` or add Expo as a second FitConnect app.
