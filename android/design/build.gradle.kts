// Elite Surface design tokens — GENERATED Kotlin constants only.
// Source of truth: packages/design-tokens (ADR-001/002/007). Regenerate with
// `pnpm tokens:kotlin` at the repo root; CI runs `pnpm tokens:kotlin:check`
// to catch drift. Pure JVM module with zero dependencies on purpose: the
// mapping to androidx.compose Color happens in the app theme (F3), keeping
// this module consumable by :app and :wear alike.
plugins {
    alias(libs.plugins.kotlin.jvm)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}
