package com.fitconnect.android.athlete.data

import com.fitconnect.android.foundation.session.SessionStore

/**
 * Canonical athlete id for UI/telemetry/ASCEND.
 * Never use [LocalAthleteRepository.ATHLETE_ID] on a Firebase (non-LOCAL_DEMO) session.
 */
suspend fun SessionStore.canonicalAthleteId(): String {
    val snap = snapshot()
    val uid = snap.userId?.takeIf { it.isNotBlank() }
    return when {
        uid != null -> uid
        snap.isLocalDemo -> LocalAthleteRepository.ATHLETE_ID
        else -> LocalAthleteRepository.ATHLETE_ID // guest boot only; screens should auth-gate
    }
}
