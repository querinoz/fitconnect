package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.authz.UserRole
import org.junit.Assert.assertEquals
import org.junit.Test

class DemoPersonaTest {
    @Test
    fun personasMapRoles() {
        assertEquals(UserRole.ATHLETE, DemoPersona.INES.role)
        assertEquals(UserRole.ATHLETE, DemoPersona.MARINA.role)
        assertEquals(UserRole.COACH, DemoPersona.TOMAS.role)
        assertEquals(
            setOf(UserRole.ATHLETE, UserRole.COACH),
            DemoPersona.EDUARDO.capabilities,
        )
        assertEquals(UserRole.COACH, DemoPersona.resolveRole(DemoPersona.TOMAS.email, true))
        assertEquals(UserRole.ATHLETE, DemoPersona.resolveRole(DemoPersona.INES.email, true))
    }
}
