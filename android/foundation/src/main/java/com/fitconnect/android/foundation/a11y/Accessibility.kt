package com.fitconnect.android.foundation.a11y

/**
 * Accessibility foundation constants for Elite Surface / TalkBack readiness.
 * Compose screens should use these instead of magic numbers.
 */
object Accessibility {
    /** Material / WCAG minimum touch target (dp). */
    const val MIN_TOUCH_TARGET_DP = 48

    /** Preferred primary CTA touch target (dp). */
    const val PREFERRED_TOUCH_TARGET_DP = 56

    /**
     * Content description helper — empty string marks decorative content that
     * TalkBack should skip.
     */
    fun decorative(): String = ""
}
