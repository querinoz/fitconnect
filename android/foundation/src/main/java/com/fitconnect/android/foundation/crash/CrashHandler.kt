package com.fitconnect.android.foundation.crash

import com.fitconnect.android.foundation.common.Logger

/**
 * Last-resort uncaught exception bridge. Production will forward to a crash
 * reporter; Phase 01 logs and rethrows to keep default Android crash dialogs.
 */
class CrashHandler(
    private val logger: Logger,
    private val previous: Thread.UncaughtExceptionHandler? =
        Thread.getDefaultUncaughtExceptionHandler(),
) : Thread.UncaughtExceptionHandler {

    fun install() {
        Thread.setDefaultUncaughtExceptionHandler(this)
    }

    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        logger.e("CrashHandler", "Uncaught on ${thread.name}", throwable)
        previous?.uncaughtException(thread, throwable)
    }
}
