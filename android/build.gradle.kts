// Root build file — plugins declared here (applied `false`) so app/ and
// wear/ can apply them without re-resolving versions. See
// gradle/libs.versions.toml for the version catalog (ADR-005/006/007).
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.google.services) apply false
}
