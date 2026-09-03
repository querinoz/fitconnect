package com.fitconnect.android.auth

import com.fitconnect.android.FitConnectApplication
import kotlinx.coroutines.runBlocking
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.rules.TestRule
import org.junit.runner.Description
import org.junit.runners.model.Statement

/**
 * Best-effort logout before each test without `pm clear` (which kills instrumentation).
 * For a fully clean install, run `adb shell pm clear com.fitconnect.android` before the suite.
 */
class EnsureLoggedOutRule : TestRule {
    override fun apply(base: Statement, description: Description): Statement {
        return object : Statement() {
            override fun evaluate() {
                val app =
                    InstrumentationRegistry.getInstrumentation()
                        .targetContext
                        .applicationContext as FitConnectApplication
                runBlocking {
                    runCatching { app.container.authRepository.logout() }
                }
                base.evaluate()
            }
        }
    }
}
