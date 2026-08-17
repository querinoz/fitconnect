package com.fitconnect.android.foundation.auth

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthValidatorsTest {
    @Test
    fun rejectsEmptyAndMalformedEmail() {
        assertEquals(com.fitconnect.android.foundation.common.AppError.AuthKind.INVALID_EMAIL, AuthValidators.email(""))
        assertEquals(com.fitconnect.android.foundation.common.AppError.AuthKind.INVALID_EMAIL, AuthValidators.email("not-an-email"))
        assertNull(AuthValidators.email("a@b.com"))
    }

    @Test
    fun rejectsShortPassword() {
        assertEquals(com.fitconnect.android.foundation.common.AppError.AuthKind.WEAK_PASSWORD, AuthValidators.password("short"))
        assertNull(AuthValidators.password("password1"))
    }

    @Test
    fun detectsPasswordMismatch() {
        assertEquals(
            com.fitconnect.android.foundation.common.AppError.AuthKind.PASSWORD_MISMATCH,
            AuthValidators.passwordsMatch("password1", "password2"),
        )
        assertNull(AuthValidators.passwordsMatch("password1", "password1"))
    }
}
