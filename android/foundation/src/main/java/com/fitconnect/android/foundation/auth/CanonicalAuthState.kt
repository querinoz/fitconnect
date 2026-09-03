package com.fitconnect.android.foundation.auth

/**
 * Cross-surface P1-AUTH states. Android [AuthPhase] in the app module maps here.
 * UI must not treat local Compose state as authenticated without a session.
 */
enum class CanonicalAuthState {
    SIGNED_OUT,
    AUTHENTICATING,
    AUTHENTICATED,
    BOOTSTRAPPING,
    READY,
    AUTH_ERROR,
    AUTH_UNAVAILABLE,
    TOKEN_REFRESH,
    LOGOUT_PENDING,
}

object CanonicalAuthStateMapper {
    /**
     * @param uiPhase Android app AuthPhase name (IDLE, AUTHENTICATING, SYNCHRONIZING, SUCCESS, ERROR, …)
     */
    fun fromAndroidUi(
        uiPhase: String,
        hasSignedInUser: Boolean,
        firebaseAvailable: Boolean,
    ): CanonicalAuthState {
        if (!firebaseAvailable && !hasSignedInUser && uiPhase != "SUCCESS") {
            if (uiPhase == "ERROR") return CanonicalAuthState.AUTH_UNAVAILABLE
        }
        return when (uiPhase) {
            "IDLE" -> if (hasSignedInUser) CanonicalAuthState.AUTHENTICATED else CanonicalAuthState.SIGNED_OUT
            "AUTHENTICATING", "INITIALIZING", "VERIFYING" -> CanonicalAuthState.AUTHENTICATING
            "SYNCHRONIZING" -> CanonicalAuthState.BOOTSTRAPPING
            "SUCCESS" -> CanonicalAuthState.READY
            "ERROR" -> CanonicalAuthState.AUTH_ERROR
            "CANCELLED" -> CanonicalAuthState.SIGNED_OUT
            else -> if (hasSignedInUser) CanonicalAuthState.AUTHENTICATED else CanonicalAuthState.SIGNED_OUT
        }
    }
}
