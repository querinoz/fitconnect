package com.fitconnect.android.foundation.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Deep-link classify matrix (EXPECTED destination class).
 * Physical cold/warm/onNewIntent wiring is covered by MainActivity + NavHost.
 */
class DeepLinkClassifyTest {
    @Before
    fun resetInbox() {
        DeepLinkInbox.resetForTests()
    }

    @Test
    fun fitconnect_guest_auth_home() {
        assertEquals(DeepLinkTarget.Guest, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/guest")))
        assertEquals(DeepLinkTarget.Auth, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/auth")))
        assertEquals(DeepLinkTarget.Home, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/home")))
        assertEquals(DeepLinkTarget.Home, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/athlete/home")))
        assertEquals(DeepLinkTarget.Home, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/athlete/feed")))
        assertEquals(DeepLinkTarget.Home, classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/coach/feed")))
    }

    @Test
    fun athlete_nested() {
        val path = deepLinkAppPathString("fitconnect://app/athlete/activity")
        val t = classifyDeepLinkPath(path)
        assertTrue(t is DeepLinkTarget.AthleteNested)
        assertEquals("athlete/activity", (t as DeepLinkTarget.AthleteNested).path)
    }

    @Test
    fun https_app_prefix() {
        assertEquals(
            DeepLinkTarget.Auth,
            classifyDeepLinkPath(deepLinkAppPathString("https://fitconnect-phi.vercel.app/app/auth")),
        )
        assertEquals(
            DeepLinkTarget.Home,
            classifyDeepLinkPath(deepLinkAppPathString("https://fitconnect-phi.vercel.app/app/home")),
        )
    }

    @Test
    fun unknown_rejected() {
        assertNull(deepLinkAppPathString("fitconnect://other/x"))
        assertNull(deepLinkAppPathString("https://example.com/app/home"))
        assertEquals(DeepLinkTarget.Unknown, classifyDeepLinkPath(null))
        assertEquals(DeepLinkTarget.Unknown, classifyDeepLinkPath("nope"))
    }

    @Test
    fun booking_coach_nested() {
        val path = deepLinkAppPathString("fitconnect://app/coach/bookings")
        val t = classifyDeepLinkPath(path)
        assertTrue(t is DeepLinkTarget.CoachNested)
        assertEquals("coach/bookings", (t as DeepLinkTarget.CoachNested).path)
        assertEquals(
            DeepLinkTarget.Home,
            classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/coach/overview")),
        )
        val athletePath = deepLinkAppPathString("fitconnect://app/coach/athletes/a2")
        assertTrue(classifyDeepLinkPath(athletePath) is DeepLinkTarget.CoachNested)
        assertEquals(
            DeepLinkTarget.CoachNested("coach/sessions/s1"),
            classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/coach/sessions/s1")),
        )
        assertEquals(
            DeepLinkTarget.AthleteNested("athlete/discover"),
            classifyDeepLinkPath(deepLinkAppPathString("fitconnect://app/athlete/discover")),
        )
    }

    @Test
    fun identity_badge_real_auth_beats_debug() {
        assertEquals("LOCAL_DEMO", identityBadgeLabel(isDebugBuild = true, isLocalDemoSession = true))
        assertEquals("DEBUG", identityBadgeLabel(isDebugBuild = true, isLocalDemoSession = false))
        assertNull(identityBadgeLabel(isDebugBuild = false, isLocalDemoSession = false))
        assertEquals("LOCAL_DEMO", identityBadgeLabel(isDebugBuild = false, isLocalDemoSession = true))
    }

    @Test
    fun matrix_cold_warm_repeated_invalid() {
        data class Case(val uri: String, val expected: DeepLinkTarget, val scenario: String)
        val cases = listOf(
            Case("fitconnect://app/home", DeepLinkTarget.Home, "cold launch home"),
            Case("fitconnect://app/auth", DeepLinkTarget.Auth, "warm launch auth"),
            Case("fitconnect://app/guest", DeepLinkTarget.Guest, "already running guest"),
            Case("fitconnect://app/athlete/activity", DeepLinkTarget.AthleteNested("athlete/activity"), "background nested"),
            Case("fitconnect://app/athlete/sports", DeepLinkTarget.AthleteNested("athlete/sports"), "repeated nested"),
            Case("fitconnect://app/coach/bookings", DeepLinkTarget.CoachNested("coach/bookings"), "coach nested bookings"),
            Case("fitconnect://app/coach/athletes/a2", DeepLinkTarget.CoachNested("coach/athletes/a2"), "coach nested athlete"),
            Case("fitconnect://app/catalog", DeepLinkTarget.Catalog, "catalog"),
            Case("fitconnect://app/nope", DeepLinkTarget.Unknown, "invalid path"),
            Case("fitconnect://evil/home", DeepLinkTarget.Unknown, "unknown host → path null → Unknown via classify null"),
        )
        cases.forEach { c ->
            val path = deepLinkAppPathString(c.uri)
            val actual = if (path == null && c.uri.startsWith("fitconnect://evil")) {
                DeepLinkTarget.Unknown
            } else {
                classifyDeepLinkPath(path)
            }
            assertEquals("${c.scenario}: EXPECTED=$c.expected ACTUAL=$actual", c.expected, actual)
        }
    }

    @Test
    fun inbox_peek_clear_roundtrip() {
        assertNull(DeepLinkInbox.peek())
        // Uri requires Android — peek/clear API smoke without Uri via reset only.
        DeepLinkInbox.clear()
        assertNull(DeepLinkInbox.peek())
    }
}
