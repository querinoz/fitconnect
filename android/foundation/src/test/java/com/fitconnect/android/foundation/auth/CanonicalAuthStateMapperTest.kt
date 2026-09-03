package com.fitconnect.android.foundation.auth

import org.junit.Assert.assertEquals
import org.junit.Test

class CanonicalAuthStateMapperTest {
    @Test
    fun signedOutWhenIdleWithoutUser() {
        assertEquals(
            CanonicalAuthState.SIGNED_OUT,
            CanonicalAuthStateMapper.fromAndroidUi("IDLE", hasSignedInUser = false, firebaseAvailable = true),
        )
    }

    @Test
    fun authenticatingMaps() {
        assertEquals(
            CanonicalAuthState.AUTHENTICATING,
            CanonicalAuthStateMapper.fromAndroidUi(
                "AUTHENTICATING",
                hasSignedInUser = false,
                firebaseAvailable = true,
            ),
        )
    }

    @Test
    fun synchronizingIsBootstrapping() {
        assertEquals(
            CanonicalAuthState.BOOTSTRAPPING,
            CanonicalAuthStateMapper.fromAndroidUi(
                "SYNCHRONIZING",
                hasSignedInUser = true,
                firebaseAvailable = true,
            ),
        )
    }

    @Test
    fun successIsReady() {
        assertEquals(
            CanonicalAuthState.READY,
            CanonicalAuthStateMapper.fromAndroidUi("SUCCESS", hasSignedInUser = true, firebaseAvailable = true),
        )
    }

    @Test
    fun errorIsAuthErrorWhenFirebasePresent() {
        assertEquals(
            CanonicalAuthState.AUTH_ERROR,
            CanonicalAuthStateMapper.fromAndroidUi("ERROR", hasSignedInUser = false, firebaseAvailable = true),
        )
    }
}
