// Community & Programs Engine — social sports ecosystem backbone.
// No Compose UI. Independent of all other engines: consumes them via ports.
plugins {
    alias(libs.plugins.android.library)
}

android {
    namespace = "com.fitconnect.android.community"
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
