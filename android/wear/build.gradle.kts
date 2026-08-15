// Empty-but-compiling Wear OS module — D5: the build decision (whether
// Elite Capture ever ships standalone recording on the watch) is deferred
// to the F13 gate. This module exists now so that decision doesn't force a
// project restructure later; it is not a commitment to ship it.
plugins {
    // AGP 9 built-in Kotlin: no kotlin.android plugin (see :app).
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.fitconnect.android.wear"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fitconnect.android.wear"
        // Wear OS 3 / Compose-for-Wear-OS baseline.
        minSdk = 30
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
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
    implementation(project(":core-capture"))
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.wear.compose.material)
    implementation(libs.androidx.wear.compose.foundation)
    implementation(libs.play.services.wearable)
}
