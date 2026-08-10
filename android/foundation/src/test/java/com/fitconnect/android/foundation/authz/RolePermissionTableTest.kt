package com.fitconnect.android.foundation.authz

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RolePermissionTableTest {
    @Test
    fun guestCannotAccessAthleteOs() {
        val perms = RolePermissionTable.permissionsFor(UserRole.GUEST)
        assertTrue(perms.contains(AppPermission.VIEW_GUEST_SHELL))
        assertFalse(perms.contains(AppPermission.ACCESS_ATHLETE_OS))
    }

    @Test
    fun adminHasAllPermissions() {
        val perms = RolePermissionTable.permissionsFor(UserRole.ADMIN)
        assertTrue(perms.containsAll(AppPermission.entries))
    }

    @Test
    fun coachCannotAccessAthleteOs() {
        val perms = RolePermissionTable.permissionsFor(UserRole.COACH)
        assertTrue(perms.contains(AppPermission.ACCESS_COACH_OS))
        assertFalse(perms.contains(AppPermission.ACCESS_ATHLETE_OS))
    }

    @Test
    fun anonymousCannotAccessAppShellOrAthleteOs() {
        val perms = RolePermissionTable.permissionsFor(UserRole.ANONYMOUS)
        assertFalse(perms.contains(AppPermission.ACCESS_APP_SHELL))
        assertFalse(perms.contains(AppPermission.ACCESS_ATHLETE_OS))
        assertFalse(perms.contains(AppPermission.VIEW_LOGGED_SHELL))
    }
}
