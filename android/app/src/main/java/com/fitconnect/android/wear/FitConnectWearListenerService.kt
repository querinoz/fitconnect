package com.fitconnect.android.wear

import com.fitconnect.android.FitConnectApplication
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

/**
 * Phone-side Data Layer listener. Parse-only ingest; does not invent samples.
 */
class FitConnectWearListenerService : WearableListenerService() {
    override fun onMessageReceived(messageEvent: MessageEvent) {
        val app = application as? FitConnectApplication ?: return
        app.ingestWearMessage(messageEvent.path, messageEvent.data)
    }
}

fun shouldIngestWearPath(path: String): Boolean =
    path == WearPaths.TELEMETRY_LIVE || path == WearPaths.TELEMETRY_BATCH
