// Elite Capture — the recording engine (F4): Foreground Service, GPS
// (FusedLocationProvider), barometer, BLE GATT sensor ingestion, and the
// append-only Room write path. Empty-but-compiling in F0 so the module
// boundary exists before any capture code does (ADR-005/007).
plugins {
    // AGP 9 built-in Kotlin: no kotlin.android plugin (see :app).
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.fitconnect.android.capture"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.coroutines.android)
    testImplementation("junit:junit:4.13.2")
    testImplementation(libs.kotlinx.coroutines.test)
}
