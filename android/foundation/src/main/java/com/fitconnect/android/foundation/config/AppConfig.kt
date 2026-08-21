package com.fitconnect.android.foundation.config

enum class AppEnvironment {
    DEBUG,
    STAGING,
    PRODUCTION,
}

/**
 * Central configuration. BuildConfig / remote config merge into this object
 * at the composition root — features never read BuildConfig directly.
 */
data class AppConfig(
    val environment: AppEnvironment,
    val apiBaseUrl: String,
    val trpcBaseUrl: String = apiBaseUrl.trimEnd('/') + "/api/trpc",
    val supabaseUrl: String? = null,
    val supabaseAnonKey: String? = null,
    val isDebuggable: Boolean,
    /** When false, LocalAuth must refuse credential sign-in (release without IdP). */
    val allowLocalAuth: Boolean = false,
    val fcmConfigured: Boolean = false,
    /** True only when gitignored google-services.json is present at build time. */
    val firebaseAuthConfigured: Boolean = false,
    /** Web OAuth client ID for Credential Manager. Empty until the human supplies it. */
    val googleWebClientId: String? = null,
    val releaseChannel: String = "dev",
    val versionName: String = "0.0.0",
    val versionCode: Int = 0,
    val deepLinkScheme: String = "fitconnect",
    val deepLinkHost: String = "app",
    val universalLinkHost: String = "fitconnect-phi.vercel.app",
    val connectTimeoutMs: Long = 15_000,
    val readTimeoutMs: Long = 30_000,
    val writeTimeoutMs: Long = 30_000,
) {
    /** Supabase application/data layer (realtime, REST). Not the identity provider. */
    val usesSupabaseData: Boolean =
        !supabaseUrl.isNullOrBlank() && !supabaseAnonKey.isNullOrBlank()

    val usesFirebaseIdentity: Boolean = firebaseAuthConfigured

    /**
     * Legacy alias used by realtime/data wiring — still means Supabase keys exist.
     * Identity routing uses [usesFirebaseIdentity] / [allowLocalAuth] instead.
     */
    val usesLiveAuth: Boolean = usesSupabaseData

    val usesIdentityCore: Boolean = usesFirebaseIdentity || allowLocalAuth
}
