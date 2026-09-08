package com.fitconnect.android.coach.ui.inbox

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.fitconnect.android.coach.domain.InboxItem
import com.fitconnect.android.coach.ui.LocalCoachContainer
import com.fitconnect.android.coach.ui.components.CoachLoad
import com.fitconnect.android.coach.ui.components.CoachScreenScaffold
import com.fitconnect.android.designui.components.EliteBadge
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteZenithHeader
import com.fitconnect.android.designui.components.HexBadge
import com.fitconnect.android.designui.components.HexBadgeTone
import com.fitconnect.android.designui.components.HexStatus
import com.fitconnect.android.designui.neumorphic.EosPremiumCard
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.launch

@Composable
fun InboxScreen() {
    val container = LocalCoachContainer.current
    val scope = rememberCoroutineScope()
    var result by remember { mutableStateOf<AppResult<List<InboxItem>>?>(null) }
    fun reload() { scope.launch { result = container.coachRepository.inbox() } }
    LaunchedEffect(Unit) {
        container.platform.analytics.screen("coach_inbox")
        reload()
    }

    CoachLoad(result, ::reload) { items ->
        CoachScreenScaffold(
            title = "Unified inbox",
            subtitle = "Messages · announcements · files · voice · mentions · read status",
            testTag = "coach_inbox",
            showTitle = false,
        ) {
            item {
                EosPremiumCard {
                    Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Md)) {
                        EliteZenithHeader(
                            sysLabel = "INBOX COMMAND",
                            title = "Unified inbox",
                            subtitle = "Messages, mentions, and files stay explicit about unread state.",
                            badge = {
                                HexBadge(
                                    text = items.count { it.unread }.coerceAtMost(99).toString().padStart(2, '0'),
                                    tone = HexBadgeTone.Warning,
                                )
                            },
                        )
                        HexStatus("${items.count { it.mentioned }} mentions")
                    }
                }
            }
            items(items, key = { it.id }) { item ->
                EosPremiumCard(onClick = {
                    scope.launch {
                        container.coachRepository.markRead(item.id)
                        reload()
                    }
                }) {
                    Text(
                        "${item.kind} · ${item.from}",
                        style = MaterialTheme.typography.labelLarge,
                    )
                    Text(item.preview, style = MaterialTheme.typography.titleMedium)
                    HexStatus(if (item.unread) "UNREAD" else "READ")
                    if (item.unread) EliteBadge("UNREAD")
                    if (item.mentioned) EliteBadge("MENTION")
                    if (item.hasAttachment) EliteBadge("FILE")
                }
            }
        }
    }
}
