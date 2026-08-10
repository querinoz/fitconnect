package com.fitconnect.android.foundation.common

import android.util.Log

/**
 * App-wide logging port. Production builds should route to a crash/reporting
 * sink (Sentry) via a different implementation — never `println` from features.
 */
interface Logger {
    fun d(tag: String, message: String)
    fun i(tag: String, message: String)
    fun w(tag: String, message: String, throwable: Throwable? = null)
    fun e(tag: String, message: String, throwable: Throwable? = null)
}

class AndroidLogger(
    private val minPriority: Int = Log.DEBUG,
) : Logger {
    override fun d(tag: String, message: String) {
        if (minPriority <= Log.DEBUG) Log.d(tag, message)
    }

    override fun i(tag: String, message: String) {
        if (minPriority <= Log.INFO) Log.i(tag, message)
    }

    override fun w(tag: String, message: String, throwable: Throwable?) {
        if (minPriority <= Log.WARN) {
            if (throwable == null) Log.w(tag, message) else Log.w(tag, message, throwable)
        }
    }

    override fun e(tag: String, message: String, throwable: Throwable?) {
        if (minPriority <= Log.ERROR) {
            if (throwable == null) Log.e(tag, message) else Log.e(tag, message, throwable)
        }
    }
}
