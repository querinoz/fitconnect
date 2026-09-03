package com.fitconnect.android.auth

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextClearance
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.performTouchInput
import androidx.compose.ui.test.swipeUp
import com.fitconnect.android.FitConnectApplication
import com.fitconnect.android.MainActivity
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.RuleChain
import org.junit.rules.TestRule

/**
 * Live Firebase email/password session certification for P1-AUTH.
 *
 * Prerequisites (host machine, before running):
 *   pnpm p1-auth:provision-android-user
 *   adb shell pm clear com.fitconnect.android
 *
 * Uses project fitconnect-5d2ba (real Firebase) with synthetic @fitconnect-qa.invalid account.
 * Does NOT use Google Auth or Firebase Auth emulator.
 */
class P1AuthSessionInstrumentationTest {

    private val ensureLoggedOutRule = EnsureLoggedOutRule()
    private val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val ruleChain: TestRule = RuleChain.outerRule(ensureLoggedOutRule).around(composeRule)

    @Test
    fun emailPasswordSession_logout_relogin_preservesUid() {
        waitForGuestScreen()
        signInWithEmailPassword()

        val firstUid = readSessionUserId()
        assertNotNull("SessionStore must expose Firebase UID after sign-in", firstUid)
        assertFalse(firstUid!!.startsWith("guest"))

        signOutFromProfile()
        waitForGuestScreen()
        assertTrue(
            "Session must clear after logout",
            readSessionUserId().isNullOrBlank(),
        )

        signInWithEmailPassword()
        val secondUid = readSessionUserId()
        assertNotNull("SessionStore must expose Firebase UID after relogin", secondUid)
        assertEquals("Firebase UID must match after relogin", firstUid, secondUid)
    }

    private fun waitForGuestScreen() {
        waitForTag("screen_guest", timeoutMs = 45_000)
    }

    private fun signInWithEmailPassword() {
        composeRule.onNodeWithTag("screen_guest_primary").performClick()

        waitForTag("auth_continue_email", timeoutMs = 20_000)
        composeRule.onNodeWithTag("auth_continue_email").performClick()

        waitForTag("auth_email", timeoutMs = 10_000)
        composeRule.onNodeWithTag("auth_email").performTextClearance()
        composeRule.onNodeWithTag("auth_email").performTextInput(P1AuthTestAccount.EMAIL)
        composeRule.onNodeWithTag("auth_password").performTextClearance()
        composeRule.onNodeWithTag("auth_password").performTextInput(P1AuthTestAccount.PASSWORD)
        composeRule.onNodeWithTag("auth_submit").performClick()

        waitForPostAuthDestination(timeoutMs = 90_000)
        dismissRoleSelectIfPresent()
        waitForOnboardingOrAthleteOs(timeoutMs = 30_000)
        completeOnboardingIfPresent()
        waitForTag("athlete_os", timeoutMs = 60_000)
    }

    private fun waitForOnboardingOrAthleteOs(timeoutMs: Long) {
        composeRule.waitUntil(timeoutMs) {
            composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty() ||
                composeRule.onAllNodesWithTag("screen_onboarding").fetchSemanticsNodes().isNotEmpty()
        }
    }

    private fun waitForPostAuthDestination(timeoutMs: Long) {
        composeRule.waitUntil(timeoutMs) {
            val tags = listOf(
                "screen_role_select",
                "screen_onboarding",
                "athlete_os",
                "auth_error",
                "screen_home",
            )
            tags.any { tag ->
                composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
            }
        }
        if (composeRule.onAllNodesWithTag("auth_error").fetchSemanticsNodes().isNotEmpty()) {
            throw AssertionError("Auth failed — auth_error visible after submit")
        }
        if (composeRule.onAllNodesWithTag("screen_home").fetchSemanticsNodes().isNotEmpty()) {
            throw AssertionError(
                "Post-auth landed on screen_home (role unresolved). Visible tags: ${visibleTestTags()}",
            )
        }
    }

    private fun signOutFromProfile() {
        composeRule.onNodeWithTag("athlete_tab_profile").performClick()
        waitForTag("athlete_profile", timeoutMs = 15_000)
        composeRule.waitUntil(30_000) {
            if (composeRule.onAllNodesWithTag("athlete_sign_out").fetchSemanticsNodes().isEmpty()) {
                composeRule.onNodeWithTag("athlete_profile").performTouchInput { swipeUp() }
                false
            } else {
                true
            }
        }
        composeRule.onNodeWithTag("athlete_sign_out").performClick()
        waitForTag("screen_guest", timeoutMs = 30_000)
    }

    private fun dismissRoleSelectIfPresent() {
        if (composeRule.onAllNodesWithTag("screen_role_select").fetchSemanticsNodes().isEmpty()) return
        composeRule.onNodeWithTag("role_select_athlete").performClick()
        composeRule.waitUntil(30_000) {
            composeRule.onAllNodesWithTag("screen_role_select").fetchSemanticsNodes().isEmpty()
        }
    }

    private fun completeOnboardingIfPresent() {
        if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) return
        if (composeRule.onAllNodesWithTag("screen_onboarding").fetchSemanticsNodes().isEmpty()) {
            throw AssertionError(
                "Expected onboarding or athlete_os after auth, found: ${visibleTestTags()}",
            )
        }

        val deadline = System.currentTimeMillis() + 90_000
        while (System.currentTimeMillis() < deadline) {
            if (composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()) {
                return
            }
            if (composeRule.onAllNodesWithTag("onboarding_finish").fetchSemanticsNodes().isNotEmpty()) {
                composeRule.onNodeWithTag("onboarding_finish").performClick()
                composeRule.waitUntil(30_000) {
                    composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty()
                }
                return
            }
            val stepBefore = currentOnboardingStep()
            when {
                composeRule.onAllNodesWithTag("onboarding_skip").fetchSemanticsNodes().isNotEmpty() -> {
                    composeRule.onNodeWithTag("onboarding_skip").performClick()
                }
                composeRule.onAllNodesWithTag("onboarding_continue").fetchSemanticsNodes().isNotEmpty() -> {
                    composeRule.onNodeWithTag("onboarding_continue").performClick()
                }
                else -> Unit
            }
            composeRule.waitUntil(10_000) {
                composeRule.onAllNodesWithTag("athlete_os").fetchSemanticsNodes().isNotEmpty() ||
                    composeRule.onAllNodesWithTag("onboarding_finish").fetchSemanticsNodes().isNotEmpty() ||
                    currentOnboardingStep() > stepBefore
            }
            composeRule.waitForIdle()
        }
        throw AssertionError(
            "Onboarding did not complete within 90s. Visible tags: ${visibleTestTags()}, step=${currentOnboardingStep()}",
        )
    }

    private fun currentOnboardingStep(): Int {
        for (step in 5 downTo 0) {
            if (composeRule.onAllNodesWithTag("onboarding_step_$step").fetchSemanticsNodes().isNotEmpty()) {
                return step
            }
        }
        return -1
    }

    private fun readSessionUserId(): String? {
        var uid: String? = null
        composeRule.activityRule.scenario.onActivity { activity ->
            val app = activity.application as FitConnectApplication
            uid = runBlocking { app.container.sessionStore.snapshot().userId }
        }
        return uid
    }

    private fun waitForTag(tag: String, timeoutMs: Long) {
        try {
            composeRule.waitUntil(timeoutMs) {
                composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
            }
        } catch (e: androidx.compose.ui.test.ComposeTimeoutException) {
            throw AssertionError(
                "Timed out waiting for testTag=$tag after ${timeoutMs}ms. Visible tags: ${visibleTestTags()}",
                e,
            )
        }
    }

    private fun visibleTestTags(): List<String> {
        val known = listOf(
            "screen_guest",
            "screen_auth",
            "screen_role_select",
            "screen_onboarding",
            "athlete_os",
            "screen_home",
            "auth_error",
            "onboarding_finish",
            "onboarding_continue",
        )
        return known.filter { tag ->
            composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
        }
    }
}
