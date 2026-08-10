// Sports Intelligence Engine — central domain layer (no Compose UI).
// Athlete OS and Coach OS depend on this module; sport logic lives only here.
plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.fitconnect.android.sports"
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
