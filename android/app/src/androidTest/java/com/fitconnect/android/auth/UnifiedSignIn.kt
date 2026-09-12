package com.fitconnect.android.auth

import androidx.compose.ui.test.junit4.AndroidComposeTestRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.rules.ActivityScenarioRule
import com.fitconnect.android.MainActivity
import com.fitconnect.android.foundation.auth.DemoPersona

/**
 * Unified account sign-in for instrumentation — email/password only.
 * Never taps Athlete/Coach persona choosers (removed from AuthScreen).
 */
fun AndroidComposeTestRule<ActivityScenarioRule<MainActivity>, MainActivity>.signInUnifiedAccount(
    email: String = DemoPersona.INES.email,
    password: String = DemoPersona.DEMO_PASSWORD,
) {
    waitUntil(timeoutMillis = 45_000) {
        onAllNodesWithTag("screen_guest", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty() ||
            onAllNodesWithTag("screen_auth", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty() ||
            onAllNodesWithTag("athlete_os", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
    }
    if (onAllNodesWithTag("screen_guest", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()) {
        onNodeWithTag("screen_guest_primary").performClick()
    }
    waitUntil(timeoutMillis = 20_000) {
        onAllNodesWithTag("screen_auth", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
    }
    onNodeWithTag("auth_email").performTextInput(email)
    onNodeWithTag("auth_password").performTextInput(password)
    onNodeWithTag("auth_submit").performClick()
}
