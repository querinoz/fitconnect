package com.fitconnect.android

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import com.fitconnect.android.foundation.navigation.DeepLinkInbox
import com.fitconnect.android.ui.ErrorBoundary
import com.fitconnect.android.ui.navigation.FitConnectNavHost
import com.fitconnect.android.ui.theme.FitConnectTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        if (!BuildConfig.DEBUG) {
            window.setFlags(
                WindowManager.LayoutParams.FLAG_SECURE,
                WindowManager.LayoutParams.FLAG_SECURE,
            )
        }
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        if (Build.VERSION.SDK_INT >= 29) {
            window.isNavigationBarContrastEnforced = false
        }
        // Cold-start VIEW intent (do not setIntent — keep MAIN for ActivityScenario).
        DeepLinkInbox.offer(intent?.data)
        val app = application as FitConnectApplication
        setContent {
            FitConnectTheme(container = app.container) {
                ErrorBoundary(logger = app.container.logger) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = androidx.compose.material3.MaterialTheme.colorScheme.background,
                    ) {
                        FitConnectNavHost()
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        // Do not setIntent(VIEW): ActivityScenario matches the original MAIN launch
        // Intent; replacing it causes ignored lifecycle events and Compose dispose crashes.
        // Deep links are forwarded via DeepLinkInbox → NavHost / AthleteOsApp.
        super.onNewIntent(intent)
        DeepLinkInbox.offer(intent.data)
    }
}
