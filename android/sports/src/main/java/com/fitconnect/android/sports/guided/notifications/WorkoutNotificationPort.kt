package com.fitconnect.android.sports.guided.notifications

import com.fitconnect.android.foundation.notifications.LocalNotificationRequest
import com.fitconnect.android.foundation.notifications.NotificationCategory
import com.fitconnect.android.foundation.notifications.NotificationGateway
import com.fitconnect.android.sports.guided.domain.SyncUiStatus

/**
 * Notification port for workout sync + rest-timer lifecycle.
 * Does not add FCM. Production push remains a separate infrastructure phase.
 */
enum class RestTimerNotificationState {
    IDLE,
    RUNNING,
    PAUSED,
    COMPLETED,
    CANCELLED,
}

data class RestTimerNotificationEvent(
    val sessionId: String,
    val state: RestTimerNotificationState,
    val remainingMs: Long = 0L,
    val durationMs: Long = 0L,
)

interface WorkoutNotificationPort {
    suspend fun syncState(status: SyncUiStatus, sessionId: String)
    suspend fun restTimer(event: RestTimerNotificationEvent)
}

class GatewayWorkoutNotificationPort(
    private val gateway: NotificationGateway,
) : WorkoutNotificationPort {
    private var lastRestKey: String? = null

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

    override suspend fun restTimer(event: RestTimerNotificationEvent) {
        val notifId = restNotificationId(event.sessionId)
        when (event.state) {
            RestTimerNotificationState.IDLE,
            RestTimerNotificationState.CANCELLED,
            -> {
                gateway.cancel(notifId)
                lastRestKey = null
            }
            RestTimerNotificationState.COMPLETED -> {
                gateway.showLocal(
                    LocalNotificationRequest(
                        id = notifId,
                        title = "Rest complete",
                        body = "Ready for the next set.",
                        category = NotificationCategory.TRAINING,
                        deepLink = "fitconnect://app/athlete/workout",
                    ),
                )
                lastRestKey = null
            }
            RestTimerNotificationState.RUNNING,
            RestTimerNotificationState.PAUSED,
            -> {
                val remainingSec = (event.remainingMs / 1000L).coerceAtLeast(0L)
                val dedupeKey = "${event.state}:${remainingSec}:${event.sessionId}"
                if (dedupeKey == lastRestKey) return
                lastRestKey = dedupeKey
                val body = if (event.state == RestTimerNotificationState.PAUSED) {
                    "Rest paused · ${formatMmSs(remainingSec)} left"
                } else {
                    "Rest · ${formatMmSs(remainingSec)} remaining"
                }
                gateway.showLocal(
                    LocalNotificationRequest(
                        id = notifId,
                        title = "Rest timer",
                        body = body,
                        category = NotificationCategory.TRAINING,
                        deepLink = "fitconnect://app/athlete/workout",
                    ),
                )
            }
        }
    }

    companion object {
        fun restNotificationId(sessionId: String): Int =
            ("rest:$sessionId").hashCode()

        fun formatMmSs(totalSec: Long): String {
            val m = totalSec / 60L
            val s = totalSec % 60L
            return "%d:%02d".format(m, s)
        }
    }
}

object NoOpWorkoutNotificationPort : WorkoutNotificationPort {
    override suspend fun syncState(status: SyncUiStatus, sessionId: String) = Unit
    override suspend fun restTimer(event: RestTimerNotificationEvent) = Unit
}

/**
 * Test double that records rest-timer events without touching the system tray.
 */
class RecordingWorkoutNotificationPort : WorkoutNotificationPort {
    private val _restEvents = mutableListOf<RestTimerNotificationEvent>()
    private val _syncEvents = mutableListOf<Pair<SyncUiStatus, String>>()

    val restEvents: List<RestTimerNotificationEvent> get() = _restEvents.toList()
    val syncEvents: List<Pair<SyncUiStatus, String>> get() = _syncEvents.toList()

    override suspend fun syncState(status: SyncUiStatus, sessionId: String) {
        _syncEvents += status to sessionId
    }

    override suspend fun restTimer(event: RestTimerNotificationEvent) {
        _restEvents += event
    }

    fun clear() {
        _restEvents.clear()
        _syncEvents.clear()
    }
}
