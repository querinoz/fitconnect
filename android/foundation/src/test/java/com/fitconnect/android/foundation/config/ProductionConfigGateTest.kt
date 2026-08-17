package com.fitconnect.android.foundation.config

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ProductionConfigGateTest {
    private fun base(
        api: String = "https://fitconnect-phi.vercel.app",
        allowLocal: Boolean = false,
        supabaseUrl: String? = "https://xyz.supabase.co",
        anon: String? = "anon",
        debug: Boolean = false,
        firebase: Boolean = true,
        fcm: Boolean = true,
    ) = AppConfig(
        environment = if (debug) AppEnvironment.DEBUG else AppEnvironment.PRODUCTION,
        apiBaseUrl = api,
        supabaseUrl = supabaseUrl,
        supabaseAnonKey = anon,
        isDebuggable = debug,
        allowLocalAuth = allowLocal,
        fcmConfigured = fcm,
        firebaseAuthConfigured = firebase,
    )

    @Test
    fun enforceFailsWithoutSupabase() {
        val findings = ProductionConfigGate.validate(
            base(supabaseUrl = null, anon = null),
            enforce = true,
        )
        assertTrue(findings.any { it.code == "SUPABASE_MISSING" })
    }

    @Test
    fun enforceFailsOnLoopbackApi() {
        val findings = ProductionConfigGate.validate(
            base(api = "http://10.0.2.2:3001"),
            enforce = true,
        )
        assertTrue(findings.any { it.code == "API_DEV_HOST" })
    }

    @Test
    fun enforceFailsWithoutFirebase() {
        val findings = ProductionConfigGate.validate(
            base(firebase = false),
            enforce = true,
        )
        assertTrue(findings.any { it.code == "FIREBASE_MISSING" })
    }

    @Test
    fun enforceFailsWithoutFcm() {
        val findings = ProductionConfigGate.validate(
            base(fcm = false),
            enforce = true,
        )
        assertTrue(findings.any { it.code == "FCM_MISSING" })
    }

    @Test
    fun enforcePassesValidProduction() {
        val findings = ProductionConfigGate.validate(base(), enforce = true)
        assertEquals(emptyList<ProductionConfigGate.Finding>(), findings)
    }

    @Test
    fun nonEnforceSkips() {
        val findings = ProductionConfigGate.validate(
            base(supabaseUrl = null, anon = null),
            enforce = false,
        )
        assertTrue(findings.isEmpty())
    }
}
