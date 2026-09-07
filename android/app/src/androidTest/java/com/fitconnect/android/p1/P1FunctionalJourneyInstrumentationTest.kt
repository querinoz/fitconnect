package com.fitconnect.android.p1

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import com.fitconnect.android.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TestRule

/**
 * P1 functional journey (LOCAL_DEMO) — navigates athlete surfaces that host
 * booking / social entry points. Mutation correctness is covered by web
 * BOOK-*/SOCIAL-* API tests; this certifies UI reachability + loading states.
 *
 *   adb shell pm clear com.fitconnect.android.debug
 *   cd android && .\gradlew.bat :app:connectedDebugAndroidTest
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.fitconnect.android.p1.P1FunctionalJourneyInstrumentationTest
 */
class P1FunctionalJourneyInstrumentationTest {

    private val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val ruleChain: TestRule = composeRule

    @Test
    fun athleteJourney_homeDiscoverCommunityTrainProfile() {
        signInLocalDemoAthlete()
        waitForTag("athlete_home", 30_000)

        composeRule.onNodeWithTag("athlete_tab_discover").performClick()
        waitForTag("athlete_discover", 20_000)

        // Community may live under Discover/Today nav depending on shell; try tag.
        if (composeRule.onAllNodesWithTag("athlete_tab_community").fetchSemanticsNodes().isNotEmpty()) {
            composeRule.onNodeWithTag("athlete_tab_community").performClick()
            waitForTag("athlete_community", 20_000)
        }

        composeRule.onNodeWithTag("athlete_tab_home").performClick()
        waitForTag("athlete_home", 15_000)
        composeRule.onNodeWithTag("athlete_train_fab").performClick()
        waitForTag("athlete_guided_workout", 20_000)

        composeRule.activityRule.scenario.onActivity { activity ->
            activity.onBackPressedDispatcher.onBackPressed()
        }
        composeRule.waitForIdle()
        waitForTag("athlete_home", 15_000)

        composeRule.onNodeWithTag("athlete_tab_profile").performClick()
        waitForTag("athlete_profile", 20_000)
    }

    private fun signInLocalDemoAthlete() {
        waitForTag("screen_guest", 45_000)
        composeRule.onNodeWithTag("screen_guest_primary").performClick()
        waitForTag("screen_auth", 20_000)
        composeRule.onNodeWithTag("screen_auth_primary").performClick()
        dismissRoleSelectIfPresent()
        waitForOnboardingOrAthleteOs(30_000)
        completeOnboardingIfPresent()
        waitForTag("athlete_os", 60_000)
    }

    private fun dismissRoleSelectIfPresent() {
        composeRule.waitForIdle()
        val deadline = System.currentTimeMillis() + 5_000
        while (System.currentTimeMillis() < deadline) {
            val athlete = composeRule.onAllNodesWithTag("role_select_athlete").fetchSemanticsNodes()
            if (athlete.isNotEmpty()) {
                composeRule.onNodeWithTag("role_select_athlete").performClick()
                return
            }
            Thread.sleep(200)
        }
    }

    private fun completeOnboardingIfPresent() {
        val deadline = System.currentTimeMillis() + 15_000
        while (System.currentTimeMillis() < deadline) {
            if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) return
            val skip = composeRule.onAllNodesWithTag("onboarding_skip").fetchSemanticsNodes()
            if (skip.isNotEmpty()) {
                composeRule.onNodeWithTag("onboarding_skip").performClick()
                return
            }
            val next = composeRule.onAllNodesWithTag("onboarding_next").fetchSemanticsNodes()
            if (next.isNotEmpty()) {
                composeRule.onNodeWithTag("onboarding_next").performClick()
            }
            Thread.sleep(300)
        }
    }

    private fun waitForOnboardingOrAthleteOs(timeoutMs: Long) {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (System.currentTimeMillis() < deadline) {
            if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) return
            if (composeRule.onAllNodesWithTag("onboarding_skip").fetchSemanticsNodes().isNotEmpty()) return
            if (composeRule.onAllNodesWithTag("onboarding_next").fetchSemanticsNodes().isNotEmpty()) return
            Thread.sleep(200)
        }
    }

    private fun waitForTag(tag: String, timeoutMs: Long) {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (System.currentTimeMillis() < deadline) {
            if (composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()) {
                composeRule.waitForIdle()
                return
            }
            Thread.sleep(200)
        }
        error("Timed out waiting for tag=$tag")
    }
}
