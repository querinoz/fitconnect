package com.fitconnect.android.athlete

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import com.fitconnect.android.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TestRule

/**
 * Guided workout smoke: Train FAB → PREP → Start → ACTIVE.
 * Requires emulator + local demo auth path.
 */
class GuidedWorkoutInstrumentationTest {

    private val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val ruleChain: TestRule = composeRule

    @Test
    fun trainFabOpensGuidedWorkoutPrepAndStart() {
        signInLocalDemo()
        composeRule.onNodeWithTag("athlete_train_fab").performClick()
        waitForTag("athlete_guided_workout", 30_000)
        waitForTag("workout_prep", 15_000)
        composeRule.onNodeWithTag("workout_start").performClick()
        waitForTag("workout_active", 15_000)
        composeRule.onNodeWithTag("workout_log_set").performClick()
        waitForTag("workout_rest", 15_000)
        composeRule.onNodeWithTag("workout_skip_rest").performClick()
        waitForTag("workout_active", 15_000)
        composeRule.onNodeWithTag("workout_finish").performScrollTo().performClick()
        waitForTag("workout_complete", 30_000)
    }

    private fun signInLocalDemo() {
        waitForTag("screen_guest", 45_000)
        composeRule.onNodeWithTag("screen_guest_primary").performClick()
        waitForTag("screen_auth", 20_000)
        composeRule.onNodeWithTag("screen_auth_primary").performClick()
        dismissRoleSelectIfPresent()
        waitForOnboardingOrAthleteOs(30_000)
        completeOnboardingIfPresent()
        waitForTag("athlete_os", 60_000)
        waitForTag("athlete_home", 30_000)
    }

    private fun dismissRoleSelectIfPresent() {
        if (composeRule.onAllNodesWithTag("screen_role_select").fetchSemanticsNodes().isEmpty()) return
        composeRule.onNodeWithTag("role_select_athlete").performClick()
        composeRule.waitUntil(30_000) {
            composeRule.onAllNodesWithTag("screen_role_select").fetchSemanticsNodes().isEmpty()
        }
    }

    private fun waitForOnboardingOrAthleteOs(timeoutMs: Long) {
        composeRule.waitUntil(timeoutMs) {
            composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty() ||
                composeRule.onAllNodesWithTag("screen_onboarding").fetchSemanticsNodes().isNotEmpty()
        }
    }

    private fun completeOnboardingIfPresent() {
        if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) return
        if (composeRule.onAllNodesWithTag("screen_onboarding").fetchSemanticsNodes().isEmpty()) return
        val deadline = System.currentTimeMillis() + 90_000
        while (System.currentTimeMillis() < deadline) {
            if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) return
            if (composeRule.onAllNodesWithTag("onboarding_finish").fetchSemanticsNodes().isNotEmpty()) {
                composeRule.onNodeWithTag("onboarding_finish").performClick()
                composeRule.waitUntil(30_000) {
                    composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()
                }
                return
            }
            when {
                composeRule.onAllNodesWithTag("onboarding_skip").fetchSemanticsNodes().isNotEmpty() ->
                    composeRule.onNodeWithTag("onboarding_skip").performClick()
                composeRule.onAllNodesWithTag("onboarding_continue").fetchSemanticsNodes().isNotEmpty() ->
                    composeRule.onNodeWithTag("onboarding_continue").performClick()
            }
            composeRule.waitForIdle()
            Thread.sleep(400)
        }
    }

    private fun waitForTag(tag: String, timeoutMs: Long = 10_000) {
        composeRule.waitUntil(timeoutMs) {
            composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
        }
    }
}
