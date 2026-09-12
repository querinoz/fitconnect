package com.fitconnect.android.ui.auth

import com.fitconnect.android.foundation.auth.DemoPersona
import com.fitconnect.android.foundation.authz.UserRole
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Architecture lock: authentication never selects Athlete/Coach.
 * Capabilities come from entitlements after a single user login.
 */
class UnifiedLoginArchitectureTest {

    @Test
    fun authUiDefaultsToEmailSignIn_notRoleChooser() {
        assertEquals(AuthFormMode.EMAIL_SIGN_IN, AuthUiState().mode)
    }

    @Test
    fun eduardoSeedHasBothCapabilities_notLoginRoles() {
        assertTrue(DemoPersona.EDUARDO.capabilities.contains(UserRole.ATHLETE))
        assertTrue(DemoPersona.EDUARDO.capabilities.contains(UserRole.COACH))
    }

    @Test
    fun athleteOnlySeedDoesNotImplyCoachLogin() {
        assertEquals(setOf(UserRole.ATHLETE), DemoPersona.INES.capabilities)
        assertFalse(DemoPersona.INES.capabilities.contains(UserRole.COACH))
    }

    @Test
    fun coachOnlySeedDoesNotImplyAthleteLoginChooser() {
        assertEquals(setOf(UserRole.COACH), DemoPersona.TOMAS.capabilities)
    }
}
