plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
}

import java.util.Properties

fun loadSecretProps(): Properties {
    val props = Properties()
    val local = rootProject.file("local.properties")
    if (local.exists()) local.inputStream().use { props.load(it) }
    System.getenv("FITCONNECT_SUPABASE_URL")?.let { props["supabase.url"] = it }
    System.getenv("FITCONNECT_SUPABASE_ANON_KEY")?.let { props["supabase.anonKey"] = it }
    System.getenv("SUPABASE_URL")?.let { props["supabase.url"] = it }
    System.getenv("SUPABASE_ANON_KEY")?.let { props["supabase.anonKey"] = it }
    System.getenv("FITCONNECT_GOOGLE_WEB_CLIENT_ID")?.let { props["firebase.webClientId"] = it }
    return props
}

fun Properties.escaped(key: String): String {
    val raw = getProperty(key)?.trim().orEmpty()
    return raw.replace("\\", "\\\\").replace("\"", "\\\"")
}

val secretProps = loadSecretProps()
val supabaseUrl = secretProps.escaped("supabase.url")
val supabaseAnon = secretProps.escaped("supabase.anonKey")
val googleWebClientId = secretProps.escaped("firebase.webClientId")
val keystorePropsFile = rootProject.file("keystore.properties")
val googleServicesFile = file("google-services.json")
val fcmConfigured = googleServicesFile.exists()
val firebaseConfigured = fcmConfigured
val enforceProd = (project.findProperty("fitconnect.enforceProdConfig") as String?) == "true"

// SIGN-02: release signing is mandatory — never silently unsigned.
val releaseSigningReady = keystorePropsFile.exists().also { exists ->
    if (exists) {
        val props = Properties().apply { keystorePropsFile.inputStream().use { load(it) } }
        val store = rootProject.file(props.getProperty("storeFile") ?: "")
        require(store.exists()) {
            "keystore.properties storeFile does not exist: ${store.path}. Fix path or remove keystore.properties."
        }
    }
}

android {
    namespace = "com.fitconnect.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fitconnect.android"
        minSdk = 26
        targetSdk = 35
        versionCode = 13
        versionName = "0.1.0-rc.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "API_BASE_URL", "\"https://fitconnect-phi.vercel.app\"")
        buildConfigField("String", "SUPABASE_URL", "\"$supabaseUrl\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"$supabaseAnon\"")
        buildConfigField("String", "RELEASE_CHANNEL", "\"dev\"")
        buildConfigField("boolean", "ALLOW_LOCAL_AUTH", "false")
        buildConfigField("boolean", "ENFORCE_PROD_CONFIG", "false")
        buildConfigField("boolean", "FCM_CONFIGURED", if (fcmConfigured) "true" else "false")
        buildConfigField("boolean", "FIREBASE_CONFIGURED", if (firebaseConfigured) "true" else "false")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
    }

    signingConfigs {
        create("release") {
            if (releaseSigningReady) {
                val props = Properties().apply { keystorePropsFile.inputStream().use { load(it) } }
                storeFile = rootProject.file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
            buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3001\"")
            buildConfigField("String", "SUPABASE_URL", "\"$supabaseUrl\"")
            buildConfigField("String", "SUPABASE_ANON_KEY", "\"$supabaseAnon\"")
            buildConfigField("String", "RELEASE_CHANNEL", "\"debug\"")
            buildConfigField("boolean", "ALLOW_LOCAL_AUTH", "true")
            buildConfigField("boolean", "ENFORCE_PROD_CONFIG", "false")
            buildConfigField("boolean", "FCM_CONFIGURED", if (fcmConfigured) "true" else "false")
            buildConfigField("boolean", "FIREBASE_CONFIGURED", if (firebaseConfigured) "true" else "false")
            buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "API_BASE_URL", "\"https://fitconnect-phi.vercel.app\"")
            buildConfigField("String", "SUPABASE_URL", "\"$supabaseUrl\"")
            buildConfigField("String", "SUPABASE_ANON_KEY", "\"$supabaseAnon\"")
            buildConfigField("String", "RELEASE_CHANNEL", "\"rc\"")
            buildConfigField("boolean", "ALLOW_LOCAL_AUTH", "false")
            buildConfigField("boolean", "ENFORCE_PROD_CONFIG", "true")
            buildConfigField("boolean", "FCM_CONFIGURED", if (fcmConfigured) "true" else "false")
            buildConfigField("boolean", "FIREBASE_CONFIGURED", if (firebaseConfigured) "true" else "false")
            buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
            if (!releaseSigningReady) {
                // Hard fail at configuration if someone invokes release tasks without keystore.
                // Actual throw deferred to verifyReleaseSigning task (config-cache safe).
            } else {
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
        buildConfig = true
    }
}

val supabaseUrlCaptured = supabaseUrl
val supabaseAnonCaptured = supabaseAnon
val keystoreReadyCaptured = releaseSigningReady
val keystorePropsPath = keystorePropsFile.absolutePath
val fcmConfiguredCaptured = fcmConfigured

tasks.register("verifyReleaseSigning") {
    group = "verification"
    description = "SIGN-02: release must have a real keystore — never unsigned"
    val ready = keystoreReadyCaptured
    val ksPath = keystorePropsPath
    doLast {
        if (!ready) {
            throw GradleException(
                "SIGN-02 FAIL-CLOSED: android/keystore.properties missing or storeFile invalid ($ksPath). " +
                    "Copy keystore.properties.example, point to a real .jks/.keystore (gitignored). " +
                    "Do not commit secrets. Use :app:assembleDebug for engineering builds without signing.",
            )
        }
    }
}

tasks.register("verifyReleaseProductionSecrets") {
    group = "verification"
    description = "Fails if release IdP / FCM production prerequisites missing"
    val url = supabaseUrlCaptured
    val anon = supabaseAnonCaptured
    val fcm = fcmConfiguredCaptured
    doLast {
        if (url.isBlank() || anon.isBlank()) {
            throw GradleException(
                "Production Supabase URL/anon key missing. Set FITCONNECT_SUPABASE_URL + " +
                    "FITCONNECT_SUPABASE_ANON_KEY or android/local.properties supabase.url / supabase.anonKey.",
            )
        }
        if (!fcm) {
            throw GradleException(
                "FCM not configured: place android/app/google-services.json (gitignored) from Firebase Console.",
            )
        }
    }
}

tasks.matching { it.name == "assembleRelease" || it.name == "bundleRelease" || it.name == "packageRelease" }.configureEach {
    dependsOn("verifyReleaseSigning")
}

tasks.matching { it.name == "assembleRelease" || it.name == "bundleRelease" }.configureEach {
    // Always require IdP+FCM for named release artifacts (fail-closed production path).
    dependsOn("verifyReleaseProductionSecrets")
}

dependencies {
    implementation(project(":design"))
    implementation(project(":design-ui"))
    implementation(project(":foundation"))
    implementation(project(":sports"))
    implementation(project(":geo"))
    implementation(project(":telemetry"))
    implementation(project(":ai"))
    implementation(project(":athlete"))
    implementation(project(":coach"))
    implementation(project(":core-capture"))
    implementation(project(":shared"))
    implementation(project(":ascend"))
    implementation(libs.play.services.wearable)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.kotlinx.coroutines.android)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
    implementation(libs.firebase.auth)
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.coroutines.play.services)

    debugImplementation(libs.androidx.ui.tooling)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
}

// Apply Google Services only when Firebase config is present (never commit the JSON).
if (fcmConfigured) {
    apply(plugin = "com.google.gms.google-services")
}
