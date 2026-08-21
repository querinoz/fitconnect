package com.fitconnect.android.firebase

import com.fitconnect.android.foundation.crash.CrashReporter
import com.google.firebase.crashlytics.FirebaseCrashlytics

/** Forwards uncaught exceptions to Crashlytics without capturing PII in keys. */
class FirebaseCrashReporter : CrashReporter {
    override fun recordUncaught(threadName: String, throwable: Throwable) {
        runCatching {
            val crashlytics = FirebaseCrashlytics.getInstance()
            crashlytics.setCustomKey("thread", threadName.take(64))
            crashlytics.recordException(throwable)
        }
    }
}

object CrashlyticsProbe {
    /** Debug-only fatal used to verify Crashlytics upload. */
    fun forceTestCrash() {
        runCatching { FirebaseCrashlytics.getInstance().log("FitConnect Crashlytics test crash") }
        throw RuntimeException("FitConnect Crashlytics test crash")
    }
}
