package com.fitconnect.android.foundation.crash

import com.fitconnect.android.foundation.common.Logger

fun interface CrashReporter {
    fun recordUncaught(threadName: String, throwable: Throwable)
}

/**
 * Last-resort uncaught exception bridge. Forwards to [CrashReporter] (Crashlytics)
 * when configured, then rethrows via the previous handler so the system dialog stays.
 */
class CrashHandler(
    private val logger: Logger,
    private val reporter: CrashReporter? = null,
    private val previous: Thread.UncaughtExceptionHandler? =
        Thread.getDefaultUncaughtExceptionHandler(),
) : Thread.UncaughtExceptionHandler {

    fun install() {
        Thread.setDefaultUncaughtExceptionHandler(this)
    }

    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        logger.e("CrashHandler", "Uncaught on ${thread.name}", throwable)
        runCatching { reporter?.recordUncaught(thread.name, throwable) }
        previous?.uncaughtException(thread, throwable)
    }
}
