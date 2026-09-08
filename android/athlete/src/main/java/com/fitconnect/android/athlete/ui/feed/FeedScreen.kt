package com.fitconnect.android.athlete.ui.feed

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Search
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
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import com.fitconnect.android.athlete.ui.community.CommunityScreen
import com.fitconnect.android.design.EliteSurfaceColors
import com.fitconnect.android.designui.brand.EosFitConnectLockup
import com.fitconnect.android.designui.components.EliteHexatar
import com.fitconnect.android.designui.components.EliteLocalImage
import com.fitconnect.android.designui.components.EliteLocalImageExists
import com.fitconnect.android.designui.components.EosStoryRing
import com.fitconnect.android.designui.components.EosStoryState
import com.fitconnect.android.designui.theme.EliteSpace
import com.fitconnect.android.designui.theme.toColor
import com.fitconnect.android.foundation.a11y.Accessibility
import com.fitconnect.android.designui.motion.EliteMotionTokens
import com.fitconnect.android.designui.motion.MotionToken
import com.fitconnect.android.designui.theme.reduceMotionEnabled
import kotlin.math.roundToInt
import kotlinx.coroutines.launch

private val FeedSidebarWidth = 304.dp
/** In-app edge (not system nav edge) so Android Back gesture is not stolen. */
private val FeedEdgeZoneWidth = 48.dp

private data class FeedStorySpec(
    val label: String,
    val imageName: String?,
    val isAdd: Boolean = false,
    val onClick: () -> Unit,
)

/**
 * Social-first Feed — true home.
 * Side bar: Instagram-style horizontal pull from the in-app left edge (no hamburger).
 * Do not turn this into a metrics dashboard.
 */
@Composable
fun FeedScreen(
    onOpenDiscover: () -> Unit,
    onOpenPrograms: () -> Unit,
    onOpenSports: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenProfile: () -> Unit,
    onOpenAscend: () -> Unit,
    onOpenDashboard: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenCommunityLegacy: () -> Unit = {},
    onOpenActivity: () -> Unit = onOpenDashboard,
) {
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current
    val drawerWidthPx = with(density) { FeedSidebarWidth.toPx() }
    val progress = remember { Animatable(0f) }
    val isOpen by remember { derivedStateOf { progress.value > 0.02f } }
    val reduceMotion = reduceMotionEnabled()
    val settleMs = EliteMotionTokens.durationMs(MotionToken.MEDIUM, reduceMotion).coerceAtLeast(1)

    fun settle(open: Boolean) {
        scope.launch {
            progress.animateTo(
                targetValue = if (open) 1f else 0f,
                animationSpec = tween(durationMillis = settleMs),
            )
        }
    }

    BackHandler(enabled = isOpen) { settle(false) }

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .semantics { testTagsAsResourceId = true }
            .testTag("athlete_feed"),
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
                EosFitConnectLockup(
                    markSize = 26.dp,
                    wordmarkSize = 18.sp,
                    modifier = Modifier
                        .weight(1f)
                        .clickable(onClick = onOpenProfile)
                        .semantics { contentDescription = "FitConnect" },
                )
                Row(horizontalArrangement = Arrangement.spacedBy(EliteSpace.Xxs)) {
                    IconButton(
                        onClick = onOpenDiscover,
                        modifier = Modifier
                            .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                            .semantics { contentDescription = "Search" }
                            .testTag("feed_search"),
                    ) {
                        Icon(Icons.Outlined.Search, contentDescription = null)
                    }
                    IconButton(
                        onClick = onOpenNotifications,
                        modifier = Modifier
                            .size(Accessibility.MIN_TOUCH_TARGET_DP.dp)
                            .semantics { contentDescription = "Notifications" },
                    ) {
                        Icon(Icons.Outlined.Notifications, contentDescription = null)
                    }
                }
            }
            StoryStrip(
                onOpenAscend = onOpenAscend,
                onOpenDiscover = onOpenDiscover,
                onOpenProfile = onOpenProfile,
            )
            Spacer(Modifier.height(EliteSpace.Sm))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.25f))
            Box(modifier = Modifier.weight(1f)) {
                CommunityScreen(embeddedInFeed = true)
            }
        }

        // In-app left edge: swipe right / tap to open (avoids Android system Back edge).
        Box(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .fillMaxHeight()
                .width(FeedEdgeZoneWidth)
                .zIndex(2f)
                .testTag("feed_menu_open")
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
                    .clickable {
                        settle(false)
                    }
                    .semantics { contentDescription = "Close discovery backdrop" },
            )

            Surface(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(FeedSidebarWidth)
                    .statusBarsPadding()
                    .zIndex(7f)
                    .offset { IntOffset(x = ((progress.value - 1f) * drawerWidthPx).roundToInt(), y = 0) }
                    .testTag("feed_side_sheet")
                    .pointerInput(Unit) {
                        // Absorb touches — no touch-through to Feed.
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
                FeedDiscoverySheet(
                    onClose = { settle(false) },
                    onProfile = {
                        settle(false)
                        onOpenProfile()
                    },
                    onFindCoach = {
                        settle(false)
                        onOpenDiscover()
                    },
                    onFindSpecialist = {
                        settle(false)
                        onOpenDiscover()
                    },
                    onSports = {
                        settle(false)
                        onOpenSports()
                    },
                    onPrograms = {
                        settle(false)
                        onOpenPrograms()
                    },
                    onNearby = {
                        settle(false)
                        onOpenDiscover()
                    },
                    onCommunity = {
                        settle(false)
                        onOpenCommunityLegacy()
                    },
                    onFollowing = {
                        settle(false)
                        onOpenCommunityLegacy()
                    },
                    onSaved = {
                        settle(false)
                        onOpenCommunityLegacy()
                    },
                    onNotifications = {
                        settle(false)
                        onOpenNotifications()
                    },
                    onTrainingHistory = {
                        settle(false)
                        onOpenActivity()
                    },
                    onAchievements = {
                        settle(false)
                        onOpenAscend()
                    },
                    onRecords = {
                        settle(false)
                        onOpenAscend()
                    },
                    onGoals = {
                        settle(false)
                        onOpenAscend()
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
private fun StoryStrip(
    onOpenAscend: () -> Unit,
    onOpenDiscover: () -> Unit,
    onOpenProfile: () -> Unit,
) {
    val items = listOf(
        FeedStorySpec("Your Story", null, isAdd = true, onClick = onOpenProfile),
        FeedStorySpec("alex.fit", "fc_story_alex", onClick = onOpenDiscover),
        FeedStorySpec("king_kai", "fc_story_kai", onClick = onOpenAscend),
        FeedStorySpec("train.with.em", "fc_story_em", onClick = onOpenDiscover),
        FeedStorySpec("lucas.mvmt", "fc_story_lucas", onClick = onOpenAscend),
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = EliteSpace.Md)
            .testTag("feed_story_strip"),
        horizontalArrangement = Arrangement.spacedBy(EliteSpace.Md),
    ) {
        items.forEachIndexed { index, story ->
            EosStoryRing(
                label = story.label,
                onClick = story.onClick,
                imageName = story.imageName,
                isAdd = story.isAdd,
                state = when {
                    story.isAdd -> EosStoryState.Active
                    index == 1 -> EosStoryState.Unseen
                    index % 2 == 0 -> EosStoryState.Unseen
                    else -> EosStoryState.Seen
                },
            )
        }
    }
}

@Composable
fun FeedDiscoverySheet(
    onClose: () -> Unit,
    onProfile: () -> Unit,
    onFindCoach: () -> Unit,
    onFindSpecialist: () -> Unit,
    onSports: () -> Unit,
    onPrograms: () -> Unit,
    onNearby: () -> Unit,
    onCommunity: () -> Unit,
    onFollowing: () -> Unit,
    onSaved: () -> Unit,
    onNotifications: () -> Unit,
    onTrainingHistory: () -> Unit,
    onAchievements: () -> Unit,
    onRecords: () -> Unit,
    onGoals: () -> Unit,
    onHelp: () -> Unit,
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
        SheetLink("Profile", "Identity and connections", onProfile, "feed_menu_profile")

        Text(
            "DISCOVER",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.VOLTLINE.toColor(),
        )
        SheetLink("Find a Coach", "Search coaches by sport and focus", onFindCoach, "feed_menu_find_coach")
        SheetLink("Find a Specialist", "Physio, nutrition, performance", onFindSpecialist, "feed_menu_find_specialist")
        SheetLink("Sports", "Sport catalog", onSports, "feed_menu_sports")
        SheetLink("Programs", "Enrollment and plans", onPrograms, "feed_menu_programs")
        SheetLink("Nearby", "Map and local specialists", onNearby, "feed_menu_nearby")

        Text(
            "SOCIAL",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.IRIS.toColor(),
        )
        SheetLink("Community", "People and posts around you", onCommunity, "feed_menu_community")
        SheetLink("Following", "Athletes and coaches you follow", onFollowing, "feed_menu_following")
        SheetLink("Saved", "Saved posts and programs", onSaved, "feed_menu_saved")
        SheetLink("Notifications", "Alerts and mentions", onNotifications, "feed_menu_notifications")

        Text(
            "PERFORMANCE",
            style = MaterialTheme.typography.labelMedium,
            color = EliteSurfaceColors.TELEMETRY.toColor(),
        )
        SheetLink("Training History", "Past sessions and load", onTrainingHistory, "feed_menu_history")
        SheetLink("Achievements", "Unlocked milestones", onAchievements, "feed_menu_achievements")
        SheetLink("Records", "Personal bests", onRecords, "feed_menu_records")
        SheetLink("Goals", "Active objectives", onGoals, "feed_menu_goals")

        Text(
            "OTHER",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        SheetLink("Help", "Support and guides", onHelp, "feed_menu_help")
        Spacer(Modifier.height(EliteSpace.Xl))
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
            Text(title, style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.onBackground)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
