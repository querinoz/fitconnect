package com.fitconnect.android.foundation.auth

import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.session.SessionStore

/**
 * Biometric unlock gate. UI hosts the system prompt; this port only decides
 * whether unlock is available and records the outcome into the session.
 */
interface BiometricGate {
    suspend fun isAvailable(): Boolean
    suspend fun isEnabled(): Boolean
    suspend fun setEnabled(enabled: Boolean): AppResult<Unit>
}

class SessionBiometricGate(
    private val sessionStore: SessionStore,
    private val featureFlags: FeatureFlagStore,
    private val deviceSupportsBiometric: () -> Boolean = { true },
) : BiometricGate {
    override suspend fun isAvailable(): Boolean =
        featureFlags.isEnabled(FeatureFlag.AUTH_BIOMETRIC) && deviceSupportsBiometric()

    override suspend fun isEnabled(): Boolean =
        isAvailable() && sessionStore.snapshot().biometricUnlockEnabled

    override suspend fun setEnabled(enabled: Boolean): AppResult<Unit> {
        if (enabled && !isAvailable()) {
            return AppResult.Err(
                com.fitconnect.android.foundation.common.AppError.Auth(
                    com.fitconnect.android.foundation.common.AppError.AuthKind.UNAUTHENTICATED,
                ),
            )
        }
        val snap = sessionStore.snapshot()
        return sessionStore.save(snap.copy(biometricUnlockEnabled = enabled))
    }
}
