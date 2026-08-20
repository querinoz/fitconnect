package com.fitconnect.android.foundation.identity

import com.fitconnect.android.foundation.authz.UserRole
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.storage.KeyValueStore
import com.fitconnect.android.foundation.storage.PreferenceKeys
import com.fitconnect.android.foundation.storage.markCoachOnboardingDone
import com.fitconnect.android.foundation.storage.markOnboardingDone
import com.fitconnect.android.foundation.storage.setAthleteOnboardingGoal
import com.fitconnect.android.foundation.storage.setAthleteOnboardingSport
import com.fitconnect.android.foundation.storage.setAthleteOnboardingStep
import com.fitconnect.android.foundation.storage.setCoachOnboardingStep
import org.json.JSONObject

data class IdentityProfile(
    val uid: String,
    val email: String?,
    val displayName: String?,
    val avatarUrl: String?,
    val locale: String?,
    val timezone: String?,
    val accent: String?,
    val role: UserRole?,
    val onboardingCompleted: Boolean,
    val onboardingStep: Int,
)

data class IdentityOnboarding(
    val uid: String,
    val role: UserRole?,
    val step: Int,
    val completed: Boolean,
    val payload: String,
)

interface IdentityRemote {
    suspend fun bootstrap(
        displayName: String?,
        email: String?,
        photoUrl: String?,
    ): AppResult<IdentityProfile>

    suspend fun getProfile(): AppResult<IdentityProfile>

    suspend fun setRole(role: UserRole): AppResult<IdentityProfile>

    suspend fun getOnboarding(): AppResult<IdentityOnboarding>

    suspend fun putOnboarding(state: IdentityOnboarding): AppResult<IdentityOnboarding>

    suspend fun deleteAccount(): AppResult<Unit>
}

suspend fun IdentityRemote.hydrateLocalOnboarding(store: KeyValueStore): AppResult<IdentityOnboarding> {
    return when (val remote = getOnboarding()) {
        is AppResult.Err -> remote
        is AppResult.Ok -> {
            val state = remote.value
            store.set(PreferenceKeys.ONBOARDING_ATHLETE_STEP, state.step.coerceIn(0, 5).toString())
            if (state.completed) {
                store.markOnboardingDone()
                store.markCoachOnboardingDone()
            }
            val payload = runCatching { JSONObject(state.payload) }.getOrNull()
            payload?.optString("sport")?.takeIf { it.isNotBlank() }?.let {
                store.setAthleteOnboardingSport(it)
            }
            payload?.optString("goal")?.takeIf { it.isNotBlank() }?.let {
                store.setAthleteOnboardingGoal(it)
            }
            if (state.role == UserRole.COACH) {
                store.setCoachOnboardingStep(state.step)
            } else {
                store.setAthleteOnboardingStep(state.step)
            }
            AppResult.Ok(state)
        }
    }
}
