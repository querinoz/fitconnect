package com.fitconnect.android.push

import com.fitconnect.android.foundation.notifications.NotificationCategory
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class FcmRemoteMapperTest {
    @Test
    fun mapsNotificationAndData() {
        val request = FcmRemoteMapper.toLocalRequest(
            data = mapOf(
                "category" to "training",
                "deepLink" to "fitconnect://app/athlete/home",
            ),
            notificationTitle = "Session ready",
            notificationBody = "Warm-up in 10",
            messageId = "abc",
            fallbackTitle = "FitConnect",
        )
        requireNotNull(request)
        assertEquals("Session ready", request.title)
        assertEquals("Warm-up in 10", request.body)
        assertEquals(NotificationCategory.TRAINING, request.category)
        assertEquals("fitconnect://app/athlete/home", request.deepLink)
        assertEquals("abc".hashCode(), request.id)
    }

    @Test
    fun ignoresPayloadWithoutTitle() {
        assertNull(
            FcmRemoteMapper.toLocalRequest(
                data = emptyMap(),
                notificationTitle = null,
                notificationBody = "x",
                messageId = null,
                fallbackTitle = "FitConnect",
            ),
        )
    }

    @Test
    fun usesDataTitleWhenNotificationMissing() {
        val request = FcmRemoteMapper.toLocalRequest(
            data = mapOf("title" to "Ping", "body" to "ok", "link" to "fitconnect://app/home"),
            notificationTitle = null,
            notificationBody = null,
            messageId = null,
            fallbackTitle = "FitConnect",
        )
        requireNotNull(request)
        assertEquals("Ping", request.title)
        assertEquals("ok", request.body)
        assertEquals("fitconnect://app/home", request.deepLink)
        assertEquals(NotificationCategory.SYSTEM, request.category)
    }

    @Test
    fun typedBookingAndSessionPayloads() {
        val booking = FcmRemoteMapper.toLocalRequest(
            data = mapOf(
                "title" to "Booking",
                "body" to "Confirmed",
                "type" to "booking",
                "role" to "coach",
            ),
            notificationTitle = null,
            notificationBody = null,
            messageId = "b1",
            fallbackTitle = "FitConnect",
        )
        requireNotNull(booking)
        assertEquals("fitconnect://app/coach/bookings", booking.deepLink)

        val session = FcmRemoteMapper.toLocalRequest(
            data = mapOf(
                "title" to "Session",
                "type" to "session",
                "sessionId" to "s7",
                "role" to "athlete",
            ),
            notificationTitle = null,
            notificationBody = null,
            messageId = "s1",
            fallbackTitle = "FitConnect",
        )
        requireNotNull(session)
        assertEquals("fitconnect://app/athlete/training/s7", session.deepLink)
    }

    @Test
    fun athleteAliasCanonicalized() {
        val request = FcmRemoteMapper.toLocalRequest(
            data = mapOf(
                "title" to "Athlete alert",
                "deep_link" to "fitconnect://app/athlete/session/s9",
            ),
            notificationTitle = null,
            notificationBody = "go",
            messageId = null,
            fallbackTitle = "FitConnect",
        )
        requireNotNull(request)
        assertEquals("fitconnect://app/athlete/training/s9", request.deepLink)
    }

    @Test
    fun evilDeepLinkDropped() {
        val request = FcmRemoteMapper.toLocalRequest(
            data = mapOf(
                "title" to "Nope",
                "link" to "https://evil.example/app/home",
            ),
            notificationTitle = null,
            notificationBody = null,
            messageId = null,
            fallbackTitle = "FitConnect",
        )
        requireNotNull(request)
        assertNull(request.deepLink)
    }
}
