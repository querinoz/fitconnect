package com.fitconnect.android.foundation.notifications

import com.fitconnect.android.foundation.navigation.DeepLinkTarget
import com.fitconnect.android.foundation.navigation.classifyDeepLinkPath
import com.fitconnect.android.foundation.navigation.deepLinkAppPathString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class NotificationDeepLinkRouterTest {
    @Test
    fun booking_athlete_and_coach() {
        assertEquals(
            "fitconnect://app/athlete/discover",
            NotificationDeepLinkRouter.resolve(type = "booking", roleHint = "athlete"),
        )
        assertEquals(
            "fitconnect://app/coach/bookings",
            NotificationDeepLinkRouter.resolve(type = "booking", roleHint = "coach"),
        )
        assertEquals(
            "fitconnect://app/athlete/discover",
            NotificationDeepLinkRouter.resolve(deepLink = "fitconnect://app/athlete/booking"),
        )
        assertEquals(
            "fitconnect://app/coach/bookings",
            NotificationDeepLinkRouter.resolve(deepLink = "coach/booking"),
        )
    }

    @Test
    fun session_athlete_and_coach() {
        assertEquals(
            "fitconnect://app/athlete/training/s1",
            NotificationDeepLinkRouter.resolve(type = "session", entityId = "s1", roleHint = "athlete"),
        )
        assertEquals(
            "fitconnect://app/coach/sessions/s9",
            NotificationDeepLinkRouter.resolve(type = "session", entityId = "s9", roleHint = "coach"),
        )
        assertEquals(
            "fitconnect://app/athlete/training/s2",
            NotificationDeepLinkRouter.resolve(deepLink = "fitconnect://app/athlete/session/s2"),
        )
        assertEquals(
            "fitconnect://app/coach/sessions/s3",
            NotificationDeepLinkRouter.resolve(deepLink = "fitconnect://app/coach/session/s3"),
        )
    }

    @Test
    fun athlete_destination_for_coach() {
        assertEquals(
            "fitconnect://app/coach/athletes/a2",
            NotificationDeepLinkRouter.resolve(type = "athlete", entityId = "a2"),
        )
        assertEquals(
            "fitconnect://app/coach/athletes/a2",
            NotificationDeepLinkRouter.resolve(deepLink = "fitconnect://app/coach/athletes/a2"),
        )
    }

    @Test
    fun https_and_relative_paths() {
        assertEquals(
            "fitconnect://app/athlete/training/s1",
            NotificationDeepLinkRouter.resolve(
                deepLink = "https://fitconnect-phi.vercel.app/app/athlete/training/s1",
            ),
        )
        assertEquals(
            "fitconnect://app/coach/bookings",
            NotificationDeepLinkRouter.resolve(deepLink = "coach/bookings"),
        )
    }

    @Test
    fun unrouteable_fail_closed() {
        assertNull(NotificationDeepLinkRouter.resolve(deepLink = "https://evil.example/app/home"))
        assertNull(NotificationDeepLinkRouter.resolve(deepLink = "fitconnect://evil/home"))
        assertNull(NotificationDeepLinkRouter.resolve(type = "unknown_type", entityId = "x"))
        assertNull(NotificationDeepLinkRouter.resolve(deepLink = null, type = null))
    }

    @Test
    fun classified_targets_match_nav_contract() {
        data class Case(val uri: String, val expected: DeepLinkTarget)
        val cases = listOf(
            Case("fitconnect://app/athlete/discover", DeepLinkTarget.AthleteNested("athlete/discover")),
            Case("fitconnect://app/athlete/training/s1", DeepLinkTarget.AthleteNested("athlete/training/s1")),
            Case("fitconnect://app/coach/bookings", DeepLinkTarget.CoachNested("coach/bookings")),
            Case("fitconnect://app/coach/sessions/s1", DeepLinkTarget.CoachNested("coach/sessions/s1")),
            Case("fitconnect://app/coach/athletes/a2", DeepLinkTarget.CoachNested("coach/athletes/a2")),
        )
        cases.forEach { c ->
            val routed = NotificationDeepLinkRouter.resolve(deepLink = c.uri)
            requireNotNull(routed)
            val path = deepLinkAppPathString(routed)
            assertEquals(c.expected, classifyDeepLinkPath(path))
        }
    }

    @Test
    fun tap_extras_resolve_typed_payload() {
        val extras = mapOf(
            "type" to "session",
            "sessionId" to "s42",
            "role" to "coach",
        )
        assertEquals(
            "fitconnect://app/coach/sessions/s42",
            NotificationTapExtras.resolve { extras[it] },
        )
    }

    @Test
    fun gateway_routeDeepLink_delegates() {
        val fail = FailClosedNotificationGateway(object : com.fitconnect.android.foundation.common.Logger {
            override fun d(tag: String, message: String) = Unit
            override fun i(tag: String, message: String) = Unit
            override fun w(tag: String, message: String, throwable: Throwable?) = Unit
            override fun e(tag: String, message: String, throwable: Throwable?) = Unit
        })
        assertEquals(
            "fitconnect://app/athlete/training/s1",
            fail.routeDeepLink("athlete/session/s1"),
        )
        assertNull(fail.routeDeepLink("https://evil.example/x"))
    }

    @Test
    fun aliasPath_matrix() {
        assertEquals("athlete/training/s1", NotificationDeepLinkRouter.aliasPath("athlete/session/s1"))
        assertEquals("athlete/discover", NotificationDeepLinkRouter.aliasPath("athlete/bookings"))
        assertEquals("coach/sessions/x", NotificationDeepLinkRouter.aliasPath("coach/session/x"))
        assertTrue(NotificationDeepLinkRouter.aliasPath("nope") == "nope")
    }
}
