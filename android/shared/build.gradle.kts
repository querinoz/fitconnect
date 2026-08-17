// Shared domain — KMP-ready kotlin-jvm (no Android APIs, no iOS target).
// AGP 9 built-in Kotlin conflicts with a full multiplatform plugin on :app;
// this module is the extractable commonMain surface (ADR-006 metrics stay in Rust).
plugins {
    alias(libs.plugins.kotlin.jvm)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

dependencies {
    testImplementation(libs.junit)
}
