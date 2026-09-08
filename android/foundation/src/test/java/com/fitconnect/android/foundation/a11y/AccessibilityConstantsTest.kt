package com.fitconnect.android.foundation.a11y

import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/** mobile-design / android: touch targets stay at Material / WCAG floors. */
class AccessibilityConstantsTest {
    @Test
    fun touchTargetsMeetPlatformFloors() {
        assertEquals(48, AccessibilityConstants.MIN_TOUCH_TARGET_DP)
        assertTrue(
            AccessibilityConstants.PREFERRED_TOUCH_TARGET_DP >=
                AccessibilityConstants.MIN_TOUCH_TARGET_DP,
        )
        assertEquals(56, AccessibilityConstants.PREFERRED_TOUCH_TARGET_DP)
        assertEquals("", AccessibilityConstants.decorative())
    }

    @Test
    fun aliasMatchesAccessibilityObject() {
        assertSame(Accessibility, AccessibilityConstants)
        assertEquals(Accessibility.MIN_TOUCH_TARGET_DP, AccessibilityConstants.MIN_TOUCH_TARGET_DP)
        assertEquals(
            Accessibility.PREFERRED_TOUCH_TARGET_DP,
            AccessibilityConstants.PREFERRED_TOUCH_TARGET_DP,
        )
        assertEquals(Accessibility.decorative(), AccessibilityConstants.decorative())
    }
}
