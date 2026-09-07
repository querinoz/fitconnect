package com.fitconnect.android.sports.guided.notifications

import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.sports.guided.domain.SyncUiStatus

/**
 * Minimum notification port for workout sync + future rest/session alerts.
 * Does not add FCM. Production push remains a separate infrastructure phase.
 */
interface WorkoutNotificationPort {
    suspend fun syncState(status: SyncUiStatus, sessionId: String)
}

class GatewayWorkoutNotificationPort(
    private val gateway: NotificationGateway,
) : WorkoutNotificationPort {
    override suspend fun syncState(status: SyncUiStatus, sessionId: String) {
        if (status != SyncUiStatus.SYNC_ERROR) return
        gateway.showLocal(
            LocalNotificationRequest(
                id = sessionId.hashCode(),
                title = "Workout sync",
                body = "Session saved on device. Sync will retry when you are online.",
                category = NotificationCategory.SESSION,
                deepLink = "fitconnect://app/athlete/workout",
            ),
        )
    }
}

object NoOpWorkoutNotificationPort : WorkoutNotificationPort {
    override suspend fun syncState(status: SyncUiStatus, sessionId: String) = Unit
}
