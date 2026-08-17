package com.fitconnect.android.designui.maps

import org.junit.Assert.assertEquals
import org.junit.Test

class EliteMapPhaseLogicTest {
    @Test
    fun recordedTraceIsSuccessEvenWhileWaiting() {
        assertEquals(
            EliteMapPhase.Success,
            EliteMapPhaseLogic.resolve(
                pointCount = 12,
                sessionWaitingForTrace = true,
                permissionDenied = false,
                elapsedMs = 0,
            ),
        )
    }

    @Test
    fun idleWithoutTraceIsEmptyNeverLoading() {
        assertEquals(
            EliteMapPhase.Empty,
            EliteMapPhaseLogic.resolve(
                pointCount = 0,
                sessionWaitingForTrace = false,
                permissionDenied = false,
                elapsedMs = 0,
            ),
        )
    }

    @Test
    fun sessionWithoutTraceStaysLoadingUntilTimeout() {
        assertEquals(
            EliteMapPhase.Loading,
            EliteMapPhaseLogic.resolve(
                pointCount = 1,
                sessionWaitingForTrace = true,
                permissionDenied = false,
                elapsedMs = 1_000,
                timeoutMs = 8_000,
            ),
        )
        assertEquals(
            EliteMapPhase.Error,
            EliteMapPhaseLogic.resolve(
                pointCount = 1,
                sessionWaitingForTrace = true,
                permissionDenied = false,
                elapsedMs = 8_000,
                timeoutMs = 8_000,
            ),
        )
    }

    @Test
    fun permissionDeniedIsErrorWithoutWaiting() {
        assertEquals(
            EliteMapPhase.Error,
            EliteMapPhaseLogic.resolve(
                pointCount = 0,
                sessionWaitingForTrace = true,
                permissionDenied = true,
                elapsedMs = 0,
            ),
        )
    }
}
