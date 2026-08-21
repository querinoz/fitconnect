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
            data = mapOf("title" to "Ping", "body" to "ok", "link" to "fitconnect://app"),
            notificationTitle = null,
            notificationBody = null,
            messageId = null,
            fallbackTitle = "FitConnect",
        )
        requireNotNull(request)
        assertEquals("Ping", request.title)
        assertEquals("ok", request.body)
        assertEquals("fitconnect://app", request.deepLink)
        assertEquals(NotificationCategory.SYSTEM, request.category)
    }
}
