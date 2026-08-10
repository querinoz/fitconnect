// Telemetry & Wearables Engine — provider-agnostic health data platform.
// No Compose UI. Providers are isolated adapters; features consume normalized data.
plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.fitconnect.android.telemetry"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        consumerProguardFiles("consumer-rules.pro")
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(project(":foundation"))
    implementation(libs.androidx.core.ktx)
    implementation(libs.kotlinx.coroutines.android)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}
