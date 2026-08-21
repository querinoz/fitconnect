package com.fitconnect.android.firebase

import android.app.Application
import com.fitconnect.android.BuildConfig
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.perf.FirebasePerformance

/**
 * Single Firebase init path. No-ops when [BuildConfig.FIREBASE_CONFIGURED] is false
 * so LOCAL_DEMO debug builds without google-services.json still boot.
 *
 * Never logs tokens, App Check secrets, or crash PII.
 */
object FirebaseBootstrap {
    fun start(app: Application) {
        if (!BuildConfig.FIREBASE_CONFIGURED) return
        runCatching {
            if (FirebaseApp.getApps(app).isEmpty()) {
                FirebaseApp.initializeApp(app)
            }
            installAppCheck()
            val crashlytics = FirebaseCrashlytics.getInstance()
            crashlytics.isCrashlyticsCollectionEnabled = true
            crashlytics.setCustomKey("debuggable", BuildConfig.DEBUG)
            crashlytics.setCustomKey("application_id", app.packageName)
            crashlytics.setCustomKey("release_channel", BuildConfig.RELEASE_CHANNEL)
            FirebasePerformance.getInstance().isPerformanceCollectionEnabled = true
        }
    }

    private fun installAppCheck() {
        val appCheck = FirebaseAppCheck.getInstance()
        if (BuildConfig.DEBUG) {
            val debugFactory = runCatching {
                val clazz = Class.forName(
                    "com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory",
                )
                val getInstance = clazz.getMethod("getInstance")
                @Suppress("UNCHECKED_CAST")
                getInstance.invoke(null) as com.google.firebase.appcheck.AppCheckProviderFactory
            }.getOrNull()
            if (debugFactory != null) {
                appCheck.installAppCheckProviderFactory(debugFactory)
                return
            }
        }
        appCheck.installAppCheckProviderFactory(
            PlayIntegrityAppCheckProviderFactory.getInstance(),
        )
    }
}
