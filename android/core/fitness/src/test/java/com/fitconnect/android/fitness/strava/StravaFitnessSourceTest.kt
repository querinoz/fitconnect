package com.fitconnect.android.fitness.strava

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class StravaPathAllowlistTest {
    @Test
    fun bansRetiredAndThirdPartyEndpoints() {
        assertFalse(StravaPathAllowlist.isAllowed("/clubs/1/activities"))
        assertFalse(StravaPathAllowlist.isAllowed("/clubs/1/admins"))
        assertFalse(StravaPathAllowlist.isAllowed("/clubs/1/members"))
        assertFalse(StravaPathAllowlist.isAllowed("/segments/explore"))
        assertFalse(StravaPathAllowlist.isAllowed("/activities/9/kudos"))
        assertFalse(StravaPathAllowlist.isAllowed("/activities/9/comments"))
        assertTrue(StravaPathAllowlist.isAllowed("/athlete/activities"))
    }
}

class StravaAuthTest {
    @Test
    fun authorizeUrlHasNoClientSecret() {
        val url = StravaAuth.authorizeUrl("https://fitconnect.example", "state-anti-csrf-xx")
        assertFalse(url.contains("client_secret", ignoreCase = true))
        assertTrue(url.contains("state=state-anti-csrf-xx"))
    }
}

class StravaRateLimitSnapshotTest {
    @Test
    fun brakesAtEightyFivePercent() {
        val snap = StravaRateLimitSnapshot(85, 100, 10, 1000)
        assertTrue(snap.atOrAbove(0.85))
        assertFalse(StravaRateLimitSnapshot(84, 100, 10, 1000).atOrAbove(0.85))
    }
}
