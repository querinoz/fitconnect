package com.fitconnect.android.athlete

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performSemanticsAction
import androidx.test.platform.app.InstrumentationRegistry
import com.fitconnect.android.MainActivity
import com.fitconnect.android.designui.maps.MapRenderHooks
import java.io.FileInputStream
import java.io.InputStreamReader
import org.junit.After
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TestRule

/**
 * P2-MAP E2E HARDENING — Start → PREPARING → geo inject → TRACKING → Pause → Resume → Finish.
 *
 * Emulator GPS is **TEST / SIMULATED DEVICE GPS INPUT** — not physical hardware.
 *
 * Timeout labels (for failure classification):
 * WAIT_FOR_START_BUTTON, WAIT_FOR_PREPARING, WAIT_FOR_FIRST_GPS_POINT,
 * WAIT_FOR_TRACKING, WAIT_FOR_ROUTE, WAIT_FOR_PAUSE, WAIT_FOR_RESUME, WAIT_FOR_FINISH, WAIT_FOR_COMPLETION
 */
class OutdoorMapE2EInstrumentationTest {

    private val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val ruleChain: TestRule = composeRule

    @Before
    fun enableCanvasMapFallback() {
        MapRenderHooks.forceCanvasFallback = true
    }

    @After
    fun clearCanvasMapFallback() {
        MapRenderHooks.forceCanvasFallback = false
    }

    @Test
    fun startGeoPauseResumeFinish_rendersPersistedRoute() {
        signInLocalDemo()
        grantLocation()
        openOutdoorActivity()

        waitForTag("athlete_activity", 45_000, "WAIT_FOR_SCREEN")
        waitForTag("outdoor_start", 20_000, "WAIT_FOR_START_BUTTON")
        composeRule.onNodeWithTag("activity_start").performClick()

        waitUntilPhase("PREPARING", 45_000, "WAIT_FOR_PREPARING")

        // TEST / SIMULATED DEVICE GPS INPUT — after GPS source is listening (PREPARING).
        injectRoutePoints(untilAcceptedAtLeast = 1, label = "WAIT_FOR_FIRST_GPS_POINT")
        waitUntilPhase("TRACKING", 60_000, "WAIT_FOR_TRACKING")
        waitUntilAcceptedPointsAtLeast(2, 90_000, "WAIT_FOR_ROUTE")

        val ptsBeforePause = readAcceptedPoints()
        assertTrue("Room/UI accepted points must be > 0", ptsBeforePause > 0)

        composeRule.onNodeWithTag("fitconnect_route_map").assertIsDisplayed()
        composeRule.onNodeWithTag("route_a11y_summary").assertIsDisplayed()

        waitForTag("outdoor_pause", 30_000, "WAIT_FOR_PAUSE")
        composeRule.onNodeWithTag("activity_pause").performClick()
        waitUntilPhase("PAUSED", 20_000, "WAIT_FOR_PAUSE")
        val ptsAtPause = readAcceptedPoints()
        injectEmulatorGeo(POINT_4.first, POINT_4.second)
        waitForIdleBrief()
        injectEmulatorGeo(POINT_5.first, POINT_5.second)
        waitForIdleBrief()
        assertTrue(
            "Pause must stop ACCEPT progression (was $ptsAtPause, now ${readAcceptedPoints()})",
            readAcceptedPoints() == ptsAtPause,
        )

        waitForTag("outdoor_resume", 20_000, "WAIT_FOR_RESUME")
        composeRule.onNodeWithTag("activity_resume").performClick()
        waitUntilPhase("TRACKING", 30_000, "WAIT_FOR_RESUME")
        injectRoutePoints(untilAcceptedAtLeast = ptsAtPause + 1, label = "WAIT_FOR_ROUTE", startIndex = 3)

        waitForTag("activity_finish", 30_000, "WAIT_FOR_FINISH")
        composeRule.onNodeWithTag("activity_finish")
            .performSemanticsAction(SemanticsActions.OnClick)

        try {
            composeRule.waitUntil(60_000) {
                readPhase()?.let { it == "SYNC_PENDING" || it == "COMPLETED" || it == "SYNCED" } == true ||
                    composeRule.onAllNodesWithTag("athlete_activity_route_detail").fetchSemanticsNodes().isNotEmpty() ||
                    composeRule.onAllNodesWithTag("route_detail_map").fetchSemanticsNodes().isNotEmpty()
            }
        } catch (t: Throwable) {
            throw AssertionError(
                "WAIT_FOR_COMPLETION: phase=${readPhase()} status=${outdoorStatusText()}",
                t,
            )
        }
        assertTrue(
            "Finish must leave durable SYNC_PENDING/COMPLETED (or route detail)",
            readPhase()?.let { it == "SYNC_PENDING" || it == "COMPLETED" || it == "SYNCED" } == true ||
                composeRule.onAllNodesWithTag("athlete_activity_route_detail").fetchSemanticsNodes().isNotEmpty(),
        )
    }

    private fun grantLocation() {
        val auto = InstrumentationRegistry.getInstrumentation().uiAutomation
        auto.grantRuntimePermission(TARGET, Manifest.permission.ACCESS_FINE_LOCATION)
        auto.grantRuntimePermission(TARGET, Manifest.permission.ACCESS_COARSE_LOCATION)
        if (Build.VERSION.SDK_INT >= 33) {
            runCatching {
                auto.grantRuntimePermission(TARGET, Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun openOutdoorActivity() {
        // Same-activity deep link via onNewIntent listeners (AthleteOsApp handleDeepLink).
        // Do not replace activity.intent — ActivityScenario requires the original MAIN Intent.
        composeRule.activityRule.scenario.onActivity { activity ->
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("fitconnect://app/athlete/activity")).apply {
                setPackage(TARGET)
            }
            InstrumentationRegistry.getInstrumentation().callActivityOnNewIntent(activity, intent)
        }
        composeRule.waitForIdle()
    }

    /**
     * Deterministic Lisbon northbound points — non-zero distance, fixed order.
     * TEST / SIMULATED DEVICE GPS INPUT
     */
    private fun injectRoutePoints(
        untilAcceptedAtLeast: Int,
        label: String,
        startIndex: Int = 0,
    ) {
        val points = listOf(POINT_1, POINT_2, POINT_3, POINT_4, POINT_5)
        val deadline = System.currentTimeMillis() + 90_000
        var i = startIndex
        while (System.currentTimeMillis() < deadline) {
            if (readAcceptedPoints() >= untilAcceptedAtLeast) return
            val p = points[i % points.size]
            injectEmulatorGeo(p.first, p.second)
            composeRule.waitForIdle()
            // Minimal settle for FusedLocation + filter; condition-driven loop, not a fixed 20s sleep.
            Thread.sleep(800)
            i++
        }
        error("$label: acceptedPoints=${readAcceptedPoints()} never reached $untilAcceptedAtLeast")
    }

    private fun injectEmulatorGeo(lat: Double, lon: Double) {
        val auto = InstrumentationRegistry.getInstrumentation().uiAutomation
        drain(auto.executeShellCommand("cmd location set-location --provider gps $lat $lon"))
        drain(auto.executeShellCommand("geo fix $lon $lat"))
    }

    private fun drain(pfd: ParcelFileDescriptor) {
        runCatching {
            InputStreamReader(FileInputStream(pfd.fileDescriptor)).use { it.readText() }
        }
        runCatching { pfd.close() }
    }

    private fun waitUntilPhase(token: String, timeoutMs: Long, label: String) {
        try {
            composeRule.waitUntil(timeoutMs) { readPhase() == token }
        } catch (t: Throwable) {
            throw AssertionError(
                "$label: outdoor phase never became '$token' (was '${readPhase()}', status='${outdoorStatusText()}')",
                t,
            )
        }
    }

    private fun waitUntilAcceptedPointsAtLeast(min: Int, timeoutMs: Long, label: String) {
        try {
            composeRule.waitUntil(timeoutMs) { readAcceptedPoints() >= min }
        } catch (t: Throwable) {
            throw AssertionError("$label: acceptedPoints=${readAcceptedPoints()} < $min", t)
        }
    }

    private fun readAcceptedPoints(): Int {
        val nodes = composeRule.onAllNodesWithTag("outdoor_accepted_points").fetchSemanticsNodes()
        if (nodes.isNotEmpty()) {
            val raw = nodes.first().config.getOrElse(SemanticsProperties.ContentDescription) { emptyList() }
                .joinToString()
                .ifBlank {
                    nodes.first().config.getOrElse(SemanticsProperties.Text) { emptyList() }
                        .joinToString { it.text }
                }
            raw.toIntOrNull()?.let { return it }
        }
        val text = outdoorStatusText() ?: return 0
        val match = Regex("""pts\s+(\d+)""").find(text) ?: return 0
        return match.groupValues[1].toIntOrNull() ?: 0
    }

    private fun readPhase(): String? {
        val nodes = composeRule.onAllNodesWithTag("outdoor_phase_value").fetchSemanticsNodes()
        if (nodes.isNotEmpty()) {
            val raw = nodes.first().config.getOrElse(SemanticsProperties.ContentDescription) { emptyList() }
                .joinToString()
                .ifBlank {
                    nodes.first().config.getOrElse(SemanticsProperties.Text) { emptyList() }
                        .joinToString { it.text }
                }
            if (raw.isNotBlank()) return raw.trim()
        }
        val text = outdoorStatusText() ?: return null
        return Regex("""Outdoor\s+(\w+)""").find(text)?.groupValues?.getOrNull(1)
    }

    private fun outdoorStatusText(): String? {
        val nodes = composeRule.onAllNodesWithTag("activity_outdoor_phase").fetchSemanticsNodes()
        if (nodes.isEmpty()) return null
        val node = nodes.first()
        val fromDesc = node.config.getOrElse(SemanticsProperties.ContentDescription) { emptyList() }
            .joinToString()
        if (fromDesc.isNotBlank()) return fromDesc
        return node.config.getOrElse(SemanticsProperties.Text) { emptyList() }
            .joinToString { it.text }
            .ifBlank { null }
    }

    private fun waitForIdleBrief() {
        composeRule.waitForIdle()
        Thread.sleep(500)
    }

    private fun signInLocalDemo() {
        waitForTag("screen_guest", 45_000, "WAIT_FOR_SCREEN")
        composeRule.onNodeWithTag("screen_guest_primary").performClick()
        waitForTag("screen_auth", 20_000, "WAIT_FOR_SCREEN")
        composeRule.onNodeWithTag("screen_auth_primary").performClick()
        dismissRoleSelectIfPresent()
        waitForOnboardingOrAthleteOs(30_000)
        completeOnboardingIfPresent()
        waitForTag("athlete_os", 60_000, "WAIT_FOR_SCREEN")
        waitForTag("athlete_home", 30_000, "WAIT_FOR_SCREEN")
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

    private fun waitForTag(tag: String, timeoutMs: Long, label: String) {
        try {
            composeRule.waitUntil(timeoutMs) {
                composeRule.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty()
            }
        } catch (t: Throwable) {
            throw AssertionError("$label: tag '$tag' not found within ${timeoutMs}ms", t)
        }
    }

    companion object {
        private const val TARGET = "com.fitconnect.android"

        // Deterministic route (Lisbon N) — ~0.5 km steps
        private val POINT_1 = 38.7223 to -9.1393
        private val POINT_2 = 38.7268 to -9.1393
        private val POINT_3 = 38.7313 to -9.1393
        private val POINT_4 = 38.7358 to -9.1393
        private val POINT_5 = 38.7403 to -9.1393

        init {
            // Must be set before Activity composition (Rule launches Activity before @Before).
            MapRenderHooks.forceCanvasFallback = true
        }
    }
}
