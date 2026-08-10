package com.fitconnect.android.foundation.config

/**
 * Fail-closed production gate. Release builds must not ship without IdP
 * configuration when [enforce] is true (CI release verification / signed RC).
 */
object ProductionConfigGate {
    data class Finding(val code: String, val message: String)

    fun validate(config: AppConfig, enforce: Boolean): List<Finding> {
        if (!enforce && config.isDebuggable) return emptyList()
        if (!enforce) return emptyList()

        val findings = mutableListOf<Finding>()
        val api = config.apiBaseUrl.lowercase()
        if (api.contains("localhost") || api.contains("127.0.0.1") || api.contains("10.0.2.2")) {
            findings += Finding("API_DEV_HOST", "Production API must not use loopback/dev hosts")
        }
        if (config.allowLocalAuth) {
            findings += Finding("LOCAL_AUTH", "Production must set allowLocalAuth=false")
        }
        if (!config.usesLiveAuth) {
            findings += Finding("SUPABASE_MISSING", "Production requires SUPABASE_URL and SUPABASE_ANON_KEY")
        }
        return findings
    }

    fun assertOrThrow(config: AppConfig, enforce: Boolean) {
        val findings = validate(config, enforce)
        if (findings.isNotEmpty()) {
            error("ProductionConfigGate failed: " + findings.joinToString { "${it.code}:${it.message}" })
        }
    }
}
