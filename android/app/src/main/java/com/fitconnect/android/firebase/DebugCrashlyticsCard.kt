package com.fitconnect.android.firebase

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import com.fitconnect.android.BuildConfig
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteButtonVariant
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteStack

/** Debug-only Crashlytics verification. Hidden in release. */
@Composable
fun DebugCrashlyticsCard() {
    if (!BuildConfig.DEBUG) return
    EliteCard {
        EliteStack {
            Text("Crashlytics probe", style = MaterialTheme.typography.titleMedium)
            Text(
                if (BuildConfig.FIREBASE_CONFIGURED) {
                    "Forces a test crash so Firebase Console can confirm Crashlytics. Debug builds only."
                } else {
                    "google-services.json is missing. The crash stays local until Firebase is configured."
                },
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            EliteButton(
                label = "Force test crash",
                variant = EliteButtonVariant.Destructive,
                onClick = { CrashlyticsProbe.forceTestCrash() },
                modifier = Modifier
                    .testTag("debug_crashlytics_crash")
                    .semantics { contentDescription = "Force test crash" },
            )
        }
    }
}
