package com.fitconnect.android.coach.ui.feed

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import com.fitconnect.android.coach.ui.inbox.InboxScreen
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.components.EliteHexatar
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import kotlin.math.roundToInt
import kotlinx.coroutines.launch

private val CoachSidebarWidth = 304.dp
private val CoachEdgeZoneWidth = 48.dp

/**
 * Coach Feed — social/inbox home.
 * Side bar: in-app left-edge swipe (avoids Android system Back gesture).
 */
@Composable
fun CoachFeedScreen(
    onOpenAthletes: () -> Unit,
    onOpenBookings: () -> Unit,
    onOpenPrograms: () -> Unit,
    onOpenCalendar: () -> Unit,
    onOpenRevenue: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenNotifications: () -> Unit = {},
    onOpenAscend: () -> Unit = {},
    onOpenDashboard: () -> Unit = {},
    onOpenProfile: () -> Unit = {},
) {
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val drawerWidthPx = with(density) { CoachSidebarWidth.toPx() }
    val progress = remember { Animatable(0f) }
    val isOpen by remember { derivedStateOf { progress.value > 0.02f } }

    fun settle(open: Boolean) {
        scope.launch {
            progress.animateTo(
                targetValue = if (open) 1f else 0f,
                animationSpec = tween(durationMillis = 240),
            )
        }
    }

    BackHandler(enabled = isOpen) { settle(false) }

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .testTag("coach_feed"),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = EliteSpace.Md, vertical = EliteSpace.Sm),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Box(
                    modifier = Modifier
                        .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                        .clip(CircleShape)
                        .clickable(onClick = onOpenProfile)
                        .semantics { contentDescription = "Profile" },
                    contentAlignment = Alignment.Center,
                ) {
                    EliteHexatar(
                        userId = "coach-feed-self",
                        contentDescription = "You",
                        diameter = 36.dp,
                    )
                }
                Text(
                    text = buildAnnotatedString {
                        withStyle(SpanStyle(color = MaterialTheme.colorScheme.onBackground)) {
                            append("Fit")
                        }
                        withStyle(SpanStyle(color = EliteSurfaceColors.VOLTLINE.toColor())) {
                            append("Connect")
                        }
                    },
                    style = MaterialTheme.typography.titleLarge,
                )
                IconButton(
                    onClick = onOpenNotifications,
                    modifier = Modifier
                        .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                        .semantics { contentDescription = "Notifications" },
                ) {
                    Icon(Icons.Outlined.Notifications, contentDescription = null)
                }
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f))
            Box(modifier = Modifier.weight(1f)) {
                InboxScreen()
            }
        }

        Box(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .fillMaxHeight()
                .width(CoachEdgeZoneWidth)
                .zIndex(2f)
                .testTag("coach_feed_menu_open")
                .semantics { contentDescription = "Open discovery menu" }
                .pointerInput(Unit) {
                    detectTapGestures(onTap = { settle(true) })
                }
                .pointerInput(drawerWidthPx) {
                    detectHorizontalDragGestures(
                        onDragEnd = { settle(progress.value >= 0.35f) },
                        onDragCancel = { settle(progress.value >= 0.35f) },
                        onHorizontalDrag = { change, dragAmount ->
                            change.consume()
                            val next = (progress.value + dragAmount / drawerWidthPx).coerceIn(0f, 1f)
                            scope.launch { progress.snapTo(next) }
                        },
                    )
                },
        )

        if (isOpen || progress.value > 0f) {
            val scrimAlpha = 0.55f * progress.value
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(6f)
                    .background(Color.Black.copy(alpha = scrimAlpha))
                    .pointerInput(drawerWidthPx) {
                        detectHorizontalDragGestures(
                            onDragEnd = { settle(progress.value >= 0.35f) },
                            onDragCancel = { settle(progress.value >= 0.35f) },
                            onHorizontalDrag = { change, dragAmount ->
                                change.consume()
                                val next = (progress.value + dragAmount / drawerWidthPx).coerceIn(0f, 1f)
                                scope.launch { progress.snapTo(next) }
                            },
                        )
                    }
                    .clickable { settle(false) }
                    .semantics { contentDescription = "Close discovery backdrop" },
            )

            Surface(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(CoachSidebarWidth)
                    .statusBarsPadding()
                    .zIndex(7f)
                    .offset { IntOffset(x = ((progress.value - 1f) * drawerWidthPx).roundToInt(), y = 0) }
                    .testTag("coach_feed_side_sheet")
                    .pointerInput(Unit) {
                        detectHorizontalDragGestures(
                            onDragEnd = { settle(progress.value >= 0.35f) },
                            onDragCancel = { settle(progress.value >= 0.35f) },
                            onHorizontalDrag = { change, dragAmount ->
                                change.consume()
                                val next = (progress.value + dragAmount / drawerWidthPx).coerceIn(0f, 1f)
                                scope.launch { progress.snapTo(next) }
                            },
                        )
                    },
                color = EliteSurfaceColors.FLOOR.toColor(),
                tonalElevation = 6.dp,
                shadowElevation = 10.dp,
            ) {
                CoachFeedDiscoverySheet(
                    onClose = { settle(false) },
                    onProfile = {
                        settle(false)
                        onOpenProfile()
                    },
                    onAthletes = {
                        settle(false)
                        onOpenAthletes()
                    },
                    onBookings = {
                        settle(false)
                        onOpenBookings()
                    },
                    onPrograms = {
                        settle(false)
                        onOpenPrograms()
                    },
                    onCalendar = {
                        settle(false)
                        onOpenCalendar()
                    },
                    onRevenue = {
                        settle(false)
                        onOpenRevenue()
                    },
                    onAscend = {
                        settle(false)
                        onOpenAscend()
                    },
                    onNotifications = {
                        settle(false)
                        onOpenNotifications()
                    },
                    onHelp = {
                        settle(false)
                        onOpenProfile()
                    },
                )
            }
        }
    }
}

@Composable
fun CoachFeedDiscoverySheet(
    onClose: () -> Unit,
    onProfile: () -> Unit,
    onAthletes: () -> Unit,
    onBookings: () -> Unit,
    onPrograms: () -> Unit,
    onCalendar: () -> Unit,
    onRevenue: () -> Unit,
    onAscend: () -> Unit = {},
    onNotifications: () -> Unit = {},
    onHelp: () -> Unit = {},
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(EliteSpace.Lg),
        verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("Discover", style = MaterialTheme.typography.headlineSmall)
            IconButton(onClick = onClose) {
                Icon(Icons.Outlined.Close, contentDescription = "Close menu")
            }
        }

        Text(
            "PROFILE / IDENTITY",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.VOLTLINE.toColor(),
        )
        SheetLink("Profile", "Professional identity and connections", onProfile, "coach_feed_menu_profile")

        Text(
            "DISCOVER",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.VOLTLINE.toColor(),
        )
        SheetLink("Athletes", "Roster and athlete detail", onAthletes, "coach_feed_menu_athletes")
        SheetLink("Bookings", "Requests and confirmed slots", onBookings, "coach_feed_menu_bookings")
        SheetLink("Programs", "Plans and builder", onPrograms, "coach_feed_menu_programs")
        SheetLink("Calendar", "Schedule overview", onCalendar, "coach_feed_menu_calendar")

        Text(
            "SOCIAL",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.IRIS.toColor(),
        )
        SheetLink("Notifications", "Alerts and mentions", onNotifications, "coach_feed_menu_notifications")

        Text(
            "PERFORMANCE",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.TELEMETRY.toColor(),
        )
        SheetLink("Ascend", "Coaching outcomes and progression", onAscend, "coach_feed_menu_ascend")
        SheetLink("Revenue", "Earnings and payouts", onRevenue, "coach_feed_menu_revenue")

        Text(
            "OTHER",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        SheetLink("Help", "Support and guides", onHelp, "coach_feed_menu_help")
        Spacer(modifier = Modifier.height(EliteSpace.Xl))
    }
}

@Composable
private fun SheetLink(
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    testTag: String,
) {
    TextButton(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .testTag(testTag)
            .semantics { contentDescription = title },
        contentPadding = PaddingValues(vertical = EliteSpace.Sm),
    ) {
        Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
            Text(
                title,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
