package com.fitconnect.android.wear

import com.fitconnect.shared.wear.SessionControlCommand
import com.fitconnect.shared.wear.WearPaths
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearControlListenerService : WearableListenerService() {
    override fun onMessageReceived(messageEvent: MessageEvent) {
        when (messageEvent.path) {
            WearPaths.SESSION_CONTROL -> {
                val wire = messageEvent.data.toString(Charsets.UTF_8)
                runCatching { WearRuntime.applyControl(SessionControlCommand.parse(wire)) }
            }
            WearPaths.SYNC_HEALTH -> {
                val wire = messageEvent.data.toString(Charsets.UTF_8)
                WearReadinessInbox.ingest(wire)
            }
            WearPaths.SYNC_STATUS -> Unit
            else -> return
        }
    }
}
