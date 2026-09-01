package com.fitconnect.android.athlete

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTouchInput
import androidx.compose.ui.test.swipeUp
import android.graphics.Bitmap
import androidx.test.platform.app.InstrumentationRegistry
import com.fitconnect.android.MainActivity
import java.io.File
import java.io.FileOutputStream
import org.junit.Rule
import org.junit.Test
import org.junit.rules.RuleChain
import org.junit.rules.TestRule

/**
 * Slow visual tour for manual QA on emulator — navigates all athlete tabs + Train FAB.
 *
 * Run (watch emulator window):
 *   adb -s emulator-5554 shell pm clear com.fitconnect.android.debug
 *   cd android && gradlew :app:connectedDebugAndroidTest
 *     -Pandroid.testInstrumentationRunnerArguments.class=...AthleteDemoVisualTourInstrumentationTest
 *
 * Screenshots land on device at /sdcard/Download/fitconnect-visual-tour/
 */
class AthleteDemoVisualTourInstrumentationTest {

    private val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val ruleChain: TestRule = composeRule

    @Test
    fun tour_allAthleteTabsAndTrainFab() {
        signInLocalDemo()
        pause("01_today_top")
        scrollHome()
        pause("02_today_scrolled")

        composeRule.onNodeWithTag("athlete_tab_discover").performClick()
        waitForTag("athlete_discover")
        pause("03_analysis")

        composeRule.onNodeWithTag("athlete_tab_vault").performClick()
        waitForTag("ascend_vault")
        pause("04_achievements")

        composeRule.onNodeWithTag("athlete_tab_profile").performClick()
        waitForTag("athlete_profile")
        pause("05_profile_top")
        scrollProfile()
        pause("06_profile_scrolled")

        composeRule.onNodeWithTag("athlete_tab_home").performClick()
        waitForTag("athlete_home")
        composeRule.onNodeWithTag("athlete_train_fab").performClick()
        waitForTag("athlete_activity")
        pause("07_train_activity")

        composeRule.activityRule.scenario.onActivity { activity ->
            activity.onBackPressedDispatcher.onBackPressed()
        }
        composeRule.waitForIdle()
        waitForTag("athlete_home")
        pause("08_back_to_today")
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
        pause("00_signed_in")
    }

    private fun scrollHome() {
        if (composeRule.onAllNodesWithTag("athlete_home").fetchSemanticsNodes().isNotEmpty()) {
            composeRule.onNodeWithTag("athlete_home").performTouchInput { swipeUp() }
            composeRule.waitForIdle()
        }
    }

    private fun scrollProfile() {
        repeat(2) {
            if (composeRule.onAllNodesWithTag("athlete_profile").fetchSemanticsNodes().isNotEmpty()) {
                composeRule.onNodeWithTag("athlete_profile").performTouchInput { swipeUp() }
                composeRule.waitForIdle()
            }
        }
    }

    private fun pause(label: String) {
        captureScreenshot(label)
        Thread.sleep(PAUSE_MS)
    }

    private fun captureScreenshot(label: String) {
        val bitmap = InstrumentationRegistry.getInstrumentation().uiAutomation.takeScreenshot()
            ?: return
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val dir = File(context.getExternalFilesDir(null), "fitconnect-visual-tour")
        if (!dir.exists()) dir.mkdirs()
        FileOutputStream(File(dir, "$label.png")).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
        bitmap.recycle()
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

    private fun waitForTag(tag: String, timeoutMs: Long = 30_000) {
        composeRule.waitUntil(timeoutMs) {
            composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
        }
    }

    companion object {
        /** Pause per screen so you can watch the emulator (~60s total tour). */
        private const val PAUSE_MS = 5_000L
    }
}
