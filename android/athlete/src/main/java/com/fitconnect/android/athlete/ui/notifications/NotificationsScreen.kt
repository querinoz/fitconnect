package com.fitconnect.android.athlete.ui.notifications

import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import com.fitconnect.android.athlete.domain.CoachMessage
import com.fitconnect.android.athlete.domain.NotificationItem
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteLoad
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

private data class Inbox(
    val notifications: List<NotificationItem>,
    val messages: List<CoachMessage>,
)

@Composable
fun NotificationsScreen() {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<Inbox>?>(null) }

    fun reload() {
        scope.launch {
            result = coroutineScope {
                val n = async { container.athleteRepository.notifications() }
                val m = async { container.athleteRepository.messages() }
                val nv = n.await()
                val mv = m.await()
                when {
                    nv is AppResult.Err -> nv
                    mv is AppResult.Err -> mv
                    else -> AppResult.Ok(
                        Inbox(
                            (nv as AppResult.Ok).value,
                            (mv as AppResult.Ok).value,
                        ),
                    )
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        container.platform.analytics.screen("athlete_notifications")
        reload()
    }

    AthleteLoad(result, ::reload) { inbox ->
        AthleteScreenScaffold(
            title = "Notifications",
            subtitle = "Push · coach messages · deep links",
            testTag = "athlete_notifications",
        ) {
            item { Text("Alerts", style = MaterialTheme.typography.titleMedium) }
            items(inbox.notifications, key = { it.id }) { n ->
                EliteCard {
                    Text(n.title, style = MaterialTheme.typography.titleMedium)
                    Text(n.body, style = MaterialTheme.typography.bodyMedium)
                    n.deepLink?.let {
                        Text(it, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
            item { Text("Coach messages", style = MaterialTheme.typography.titleMedium) }
            items(inbox.messages, key = { it.id }) { msg ->
                EliteCard {
                    Text(
                        if (msg.unread) "● ${msg.from}" else msg.from,
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(msg.preview, style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}
