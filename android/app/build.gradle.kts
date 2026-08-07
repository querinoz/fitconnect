plugins {
    // AGP 9 has built-in Kotlin — org.jetbrains.kotlin.android must NOT be
    // applied (it now conflicts). Only the Compose compiler plugin remains.
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.fitconnect.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fitconnect.android"
        // 26 (Health Connect's own minimum) — see docs/adr/ADR-005, F8 scope.
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(project(":design"))
    implementation(project(":core-capture"))
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)

    // elite-core (Rust) binding — not wired yet. F1 adds the real .so per
    // ABI (JNI via UniFFI, ADR-006) once elite-core/jni has real exports.
    // implementation(project(":elite-core-jni-bridge"))

    debugImplementation(libs.androidx.ui.tooling)

    testImplementation("junit:junit:4.13.2")
}
