package com.fitconnect.android.ui.navigation

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AppDestinationTest {
    @Test
    fun splashIsStartRoute() {
        assertEquals("splash", AppDestination.Splash.route)
    }

    @Test
    fun deepLinkPatternUsesCustomScheme() {
        assertTrue(AppDestination.DEEP_LINK_URI_PATTERN.startsWith("fitconnect://"))
    }
}
