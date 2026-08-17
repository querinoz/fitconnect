package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.common.AppError
import org.junit.Assert.assertEquals
import org.junit.Test

class AuthErrorMapperTest {
    @Test
    fun mapsVendorCodesWithoutLeakingSecrets() {
        assertEquals(AppError.AuthKind.INVALID_CREDENTIALS, AuthErrorMapper.fromCode("ERROR_WRONG_PASSWORD"))
        assertEquals(AppError.AuthKind.EMAIL_ALREADY_EXISTS, AuthErrorMapper.fromCode("ERROR_EMAIL_ALREADY_IN_USE"))
        assertEquals(AppError.AuthKind.WEAK_PASSWORD, AuthErrorMapper.fromCode("ERROR_WEAK_PASSWORD"))
        assertEquals(AppError.AuthKind.CANCELLED, AuthErrorMapper.fromCode("cancelled"))
        assertEquals(AppError.AuthKind.ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL, AuthErrorMapper.fromCode("ERROR_ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL"))
        assertEquals(AppError.AuthKind.TOO_MANY_REQUESTS, AuthErrorMapper.fromCode("ERROR_TOO_MANY_REQUESTS"))
    }

    @Test
    fun errHasNoCause() {
        val err = AuthErrorMapper.err(AppError.AuthKind.INVALID_CREDENTIALS)
        val auth = err.error as AppError.Auth
        assertEquals(null, auth.cause)
    }
}
