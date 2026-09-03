package com.fitconnect.shared.identity

/**
 * On-device LOCAL_DEMO athlete. Not a production account.
 *
 * Phone Athlete OS and Wear must share this id so XP/session events
 * do not fork into `ath-1` vs `wear-local` on the same device pair.
 * Web seed still uses `a-ines` — that split is a documented data-cohesion gap,
 * not an alias pretending to be a cloud identity.
 *
 * P1-AUTH: never treat this as Firebase UID / identity_profiles.id.
 * Release builds must keep allowLocalAuth=false (ProductionConfigGate).
 */
object LocalDemoIdentity {
    const val ATHLETE_ID = "ath-1"
}
