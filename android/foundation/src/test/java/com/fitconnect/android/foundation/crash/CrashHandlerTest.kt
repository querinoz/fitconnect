package com.fitconnect.android.foundation.crash

import com.fitconnect.android.foundation.common.Logger
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

class CrashHandlerTest {
    @Test
    fun forwardsToReporterThenPrevious() {
        val logged = mutableListOf<String>()
        val logger = object : Logger {
            override fun d(tag: String, message: String) = Unit
            override fun i(tag: String, message: String) = Unit
            override fun w(tag: String, message: String, throwable: Throwable?) = Unit
            override fun e(tag: String, message: String, throwable: Throwable?) {
                logged += "$tag:$message"
            }
        }
        var reported: Pair<String, Throwable>? = null
        var previousCalled = false
        val boom = IllegalStateException("probe")
        val previous = Thread.UncaughtExceptionHandler { _, thrown ->
            previousCalled = true
            assertSame(boom, thrown)
        }
        val handler = CrashHandler(
            logger = logger,
            reporter = CrashReporter { threadName, throwable ->
                reported = threadName to throwable
            },
            previous = previous,
        )
        handler.uncaughtException(Thread.currentThread(), boom)
        assertTrue(logged.isNotEmpty())
        assertEquals("probe", reported?.second?.message)
        assertTrue(previousCalled)
    }
}
