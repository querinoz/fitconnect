package com.fitconnect.android.coach.ui.notifications

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
import com.fitconnect.android.coach.domain.NotificationItem
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun NotificationsScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<NotificationItem>>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.notifications() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_notifications")
        reload()
    }

    CoachLoad(result, ::reload) { items ->
        CoachScreenScaffold(
            title = "Notifications",
            subtitle = "Push-ready inbox · deep links",
            testTag = "coach_notifications",
        ) {
            items(items, key = { it.id }) { n ->
                EliteCard {
                    Text(n.title, style = MaterialTheme.typography.titleMedium)
                    Text(n.body, style = MaterialTheme.typography.bodyMedium)
                    Text(n.deepLink, style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}
