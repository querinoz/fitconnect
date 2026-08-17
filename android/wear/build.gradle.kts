// Empty-but-compiling Wear OS module — D5: the build decision (whether
// Elite Capture ever ships standalone recording on the watch) is deferred
// to the F13 gate. This module exists now so that decision doesn't force a
// project restructure later; it is not a commitment to ship it.
plugins {
    // AGP 9 built-in Kotlin: no kotlin.android plugin (see :app).
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

import java.util.Properties

val keystorePropsFile = rootProject.file("keystore.properties")
val wearReleaseSigningReady = keystorePropsFile.exists().also { exists ->
    if (exists) {
        val props = Properties().apply { keystorePropsFile.inputStream().use { load(it) } }
        val store = rootProject.file(props.getProperty("storeFile") ?: "")
        require(store.exists()) {
            "keystore.properties storeFile does not exist: ${store.path}. Fix path or remove keystore.properties."
        }
    }
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

    signingConfigs {
        create("release") {
            if (wearReleaseSigningReady) {
                val props = Properties().apply { keystorePropsFile.inputStream().use { load(it) } }
                storeFile = rootProject.file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            if (wearReleaseSigningReady) {
                signingConfig = signingConfigs.getByName("release")
            }
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
    implementation(project(":shared"))
    implementation(project(":ascend"))
    implementation(project(":design"))
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.wear.compose.material)
    implementation(libs.androidx.wear.compose.foundation)
    implementation(libs.play.services.wearable)
    implementation(libs.kotlinx.coroutines.play.services)
    implementation(libs.androidx.health.services.client)
}

val wearKeystoreReadyCaptured = wearReleaseSigningReady
val wearKeystorePropsPath = keystorePropsFile.absolutePath

tasks.register("verifyWearReleaseSigning") {
    group = "verification"
    description = "Wear release must have a real keystore — never unsigned"
    val ready = wearKeystoreReadyCaptured
    val ksPath = wearKeystorePropsPath
    doLast {
        if (!ready) {
            throw GradleException(
                "WEAR SIGN-02 FAIL-CLOSED: android/keystore.properties missing or storeFile invalid ($ksPath). " +
                    "Copy keystore.properties.example, point to a real .jks/.keystore (gitignored). " +
                    "Use :wear:assembleDebug for engineering builds without signing.",
            )
        }
    }
}

tasks.matching { it.name == "assembleRelease" || it.name == "bundleRelease" || it.name == "packageRelease" }.configureEach {
    dependsOn("verifyWearReleaseSigning")
}
