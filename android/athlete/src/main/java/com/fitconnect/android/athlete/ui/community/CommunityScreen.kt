package com.fitconnect.android.athlete.ui.community

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
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.fitconnect.android.athlete.data.canonicalAthleteId
import com.fitconnect.android.athlete.ui.LocalAthleteContainer
import com.fitconnect.android.athlete.ui.components.AthleteScreenScaffold
import com.fitconnect.android.community.distribution.DistributionPlatform
import com.fitconnect.android.community.distribution.InMemoryDistributionEngine
import com.fitconnect.android.community.domain.ShareConsent
import com.fitconnect.android.community.di.CommunityRuntimeMode
import com.fitconnect.android.community.domain.Comment
import com.fitconnect.android.community.domain.CommunityPost
import com.fitconnect.android.community.domain.CommunityRole
import com.fitconnect.android.community.domain.MediaKind
import com.fitconnect.android.community.domain.PostKind
import com.fitconnect.android.community.domain.ReactionTargetKind
import com.fitconnect.android.community.domain.ReactionType
import com.fitconnect.android.community.domain.UserProfile
import com.fitconnect.android.community.feed.FeedKind
import com.fitconnect.android.community.feed.FeedRequest
import com.fitconnect.android.community.posts.PostDraft
import com.fitconnect.android.community.posts.PostResult
import com.fitconnect.android.designui.components.EliteButton
import com.fitconnect.android.designui.components.EliteCard
import com.fitconnect.android.designui.components.EliteCardVariant
import com.fitconnect.android.designui.components.EliteChip
import com.fitconnect.android.designui.components.EliteEmptyState
import com.fitconnect.android.designui.components.EliteFeedComment
import com.fitconnect.android.designui.components.EliteFeedPost
import com.fitconnect.android.designui.components.EliteFeedReaction
import com.fitconnect.android.designui.components.EliteFilterChip
import com.fitconnect.android.designui.components.EliteFlowRow
import com.fitconnect.android.designui.components.EliteLoading
import com.fitconnect.android.designui.components.EliteTextField
import com.fitconnect.android.designui.theme.EliteSpace
import kotlinx.coroutines.launch
import java.util.UUID

/**
 * Athlete community feed via :community engines.
 * LOCAL_DEMO → seeded in-memory; REMOTE → API; else fail-closed empty.
 */
@Composable
fun CommunityScreen(
    embeddedInFeed: Boolean = false,
) {
    val container = LocalAthleteContainer.current
    val scope = rememberCoroutineScope()
    var mode by remember { mutableStateOf(CommunityRuntimeMode.FAIL_CLOSED) }
    var posts by remember { mutableStateOf<List<CommunityPost>>(emptyList()) }
    var emptyReason by remember { mutableStateOf<String?>(null) }
    var kind by remember { mutableStateOf(FeedKind.FOLLOWING) }
    var draftText by remember { mutableStateOf("") }
    var draftKind by remember { mutableStateOf(PostKind.TEXT) }
    var status by remember { mutableStateOf<String?>(null) }
    var commentDrafts by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var reactionCounts by remember { mutableStateOf<Map<String, Map<ReactionType, Int>>>(emptyMap()) }
    var myReactions by remember { mutableStateOf<Map<String, ReactionType?>>(emptyMap()) }
    var comments by remember { mutableStateOf<Map<String, List<Comment>>>(emptyMap()) }
    var profiles by remember { mutableStateOf<Map<String, UserProfile>>(emptyMap()) }
    var loading by remember { mutableStateOf(true) }
    var createOpen by remember { mutableStateOf(false) }
    val distribution = remember { InMemoryDistributionEngine() }
    val viewerId = remember { mutableStateOf("") }

    suspend fun reload() {
        loading = true
        try {
            mode = container.community.runtimeMode()
            viewerId.value = container.platform.sessionStore.canonicalAthleteId()
            container.community.seedIfNeeded()
            val page = container.community.feed.feed(
                FeedRequest(
                    viewerId = viewerId.value,
                    kind = kind,
                    contextId = if (kind == FeedKind.SPORT) "running" else null,
                    limit = 40,
                ),
            )
            posts = page.items
            emptyReason = when {
                page.items.isNotEmpty() -> null
                mode == CommunityRuntimeMode.LOCAL_DEMO ->
                    "Create the first post for ${kind.name.lowercase()} — your squad will see it here."
                mode == CommunityRuntimeMode.REMOTE ->
                    "When teammates share sessions and wins, they appear here. Pull to refresh anytime."
                else ->
                    "Connect community services to unlock the live feed."
            }
            reactionCounts = page.items.associate { post ->
                post.id to container.community.reactions.counts(ReactionTargetKind.POST, post.id)
            }
            myReactions = page.items.associate { post ->
                post.id to container.community.reactions.of(
                    viewerId.value,
                    ReactionTargetKind.POST,
                    post.id,
                )
            }
            comments = page.items.associate { post ->
                post.id to container.community.comments.forPost(post.id, limit = 3).items
            }
            val authorIds = page.items.map { it.authorId } +
                comments.values.flatten().map { it.authorId }
            profiles = authorIds.distinct().associateWith { id ->
                container.community.profiles.get(id) ?: UserProfile(id, id, CommunityRole.ATHLETE)
            }
        } catch (t: Throwable) {
            emptyReason = t.message ?: "Community feed failed"
            posts = emptyList()
        } finally {
            loading = false
        }
    }

    LaunchedEffect(kind) {
        container.platform.analytics.screen("athlete_community")
        reload()
    }

    AthleteScreenScaffold(
        title = if (embeddedInFeed) "" else "Community",
        subtitle = when {
            embeddedInFeed -> null
            container.platform.config.visualQaChromeDiet -> "Squad · media feed"
            mode == CommunityRuntimeMode.LOCAL_DEMO -> "LOCAL_DEMO community · seed feed"
            mode == CommunityRuntimeMode.REMOTE -> "Remote community · /api/v1/community"
            else -> "Community fail-closed"
        },
        showTitle = !embeddedInFeed,
        overline = if (embeddedInFeed) null else "ATHLETE OS",
        testTag = "athlete_community",
    ) {
        item {
            // Media-first Feed: keep filters soft; Create stays primary.
            EliteFlowRow {
                if (!embeddedInFeed) {
                    EliteFilterChip(label = "Following", selected = kind == FeedKind.FOLLOWING, onClick = { kind = FeedKind.FOLLOWING })
                    EliteFilterChip(label = "Official", selected = kind == FeedKind.OFFICIAL, onClick = { kind = FeedKind.OFFICIAL })
                    EliteFilterChip(label = "Sport", selected = kind == FeedKind.SPORT, onClick = { kind = FeedKind.SPORT })
                } else {
                    EliteFilterChip(
                        label = "For you",
                        selected = kind == FeedKind.FOLLOWING,
                        onClick = { kind = FeedKind.FOLLOWING },
                    )
                    EliteFilterChip(
                        label = "Sport",
                        selected = kind == FeedKind.SPORT,
                        onClick = { kind = FeedKind.SPORT },
                    )
                }
                EliteFilterChip(
                    label = "Create",
                    selected = true,
                    onClick = { createOpen = true },
                    modifier = Modifier.testTag("community_create_open"),
                )
            }
        }
        if (!embeddedInFeed) {
            item {
                EliteCard(modifier = Modifier.testTag("community_composer"), variant = EliteCardVariant.Glass) {
                    Text("What happened today?", style = MaterialTheme.typography.titleMedium)
                    EliteFlowRow {
                        composerKinds.forEach { option ->
                            EliteChip(
                                label = option.name,
                                selected = draftKind == option,
                                onClick = { draftKind = option },
                            )
                        }
                    }
                    EliteTextField(
                        value = draftText,
                        onValueChange = { draftText = it },
                        label = "Training, recovery, mindset…",
                        modifier = Modifier.testTag("community_post_input"),
                    )
                    EliteButton(
                        label = "Publish",
                        enabled = draftText.isNotBlank(),
                        onClick = {
                            scope.launch {
                                val result = container.community.posts.create(
                                    PostDraft(
                                        idempotencyKey = UUID.randomUUID().toString(),
                                        authorId = viewerId.value,
                                        kind = draftKind,
                                        text = draftText.trim(),
                                    ),
                                )
                                status = when (result) {
                                    is PostResult.Created -> {
                                        draftText = ""
                                        "Published ${result.post.id}"
                                    }
                                    is PostResult.Duplicate -> "Duplicate blocked"
                                    PostResult.RateLimited -> "Rate limited — wait a moment"
                                    PostResult.Invalid -> when (mode) {
                                        CommunityRuntimeMode.FAIL_CLOSED ->
                                            "Publish refused — community not configured"
                                        CommunityRuntimeMode.REMOTE ->
                                            "Publish failed — check API / auth"
                                        CommunityRuntimeMode.LOCAL_DEMO -> "Invalid post"
                                    }
                                }
                                reload()
                            }
                        },
                    )
                    status?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
                }
            }
        }
        if (loading) {
            item { EliteLoading(label = "SYS.FEED") }
        }
        emptyReason?.let { reason ->
            item {
                EliteEmptyState(
                    title = "No posts yet",
                    body = reason,
                    actionLabel = "Refresh",
                    onAction = { scope.launch { reload() } },
                )
            }
        }
        items(posts, key = { it.id }) { post ->
            val author = profiles[post.authorId]
            val media = post.media.firstOrNull()
            Column(verticalArrangement = Arrangement.spacedBy(EliteSpace.Sm)) {
                EliteFeedPost(
                    authorId = post.authorId,
                    authorName = author?.displayName ?: post.authorId,
                    authorInitials = initialsOf(author?.displayName ?: post.authorId),
                    avatarName = author?.avatarUri,
                    kindLabel = post.kind.name,
                    timeLabel = relativeTime(post.audit.createdAtEpochMs),
                    body = post.text,
                    imageName = media?.thumbnailUrl ?: media?.localUri,
                    videoRawName = media?.takeIf { it.kind == MediaKind.VIDEO }?.localUri,
                    facts = workoutFactPairs(post),
                    verified = author?.verifiedCoach == true,
                    reactions = ReactionType.entries.map { type ->
                        EliteFeedReaction(
                            id = type.name,
                            label = type.chipLabel,
                            count = reactionCounts[post.id]?.get(type) ?: 0,
                            selected = myReactions[post.id] == type,
                        )
                    },
                    comments = comments[post.id].orEmpty().map { comment ->
                        EliteFeedComment(
                            author = profiles[comment.authorId]?.displayName ?: comment.authorId,
                            text = comment.text,
                        )
                    },
                    onReact = { typeName ->
                        scope.launch {
                            val type = ReactionType.entries.first { it.name == typeName }
                            val ok = container.community.reactions.react(
                                viewerId.value,
                                ReactionTargetKind.POST,
                                post.id,
                                type,
                            )
                            if (!ok && mode != CommunityRuntimeMode.LOCAL_DEMO) {
                                status = "Reaction failed"
                            }
                            reload()
                        }
                    },
                )
                if (!embeddedInFeed) {
                    val commentValue = commentDrafts[post.id].orEmpty()
                    EliteTextField(
                        value = commentValue,
                        onValueChange = { commentDrafts = commentDrafts + (post.id to it) },
                        label = "Reply",
                    )
                    EliteButton(
                        label = "Comment",
                        enabled = commentValue.isNotBlank(),
                        onClick = {
                            scope.launch {
                                val added = container.community.comments.add(
                                    postId = post.id,
                                    parentCommentId = null,
                                    authorId = viewerId.value,
                                    text = commentValue.trim(),
                                )
                                if (added != null) {
                                    commentDrafts = commentDrafts - post.id
                                    status = "Comment added"
                                } else {
                                    status = "Comment failed"
                                }
                                reload()
                            }
                        },
                    )
                }
            }
        }
    }

    CreatePostSheet(
        open = createOpen,
        onDismiss = { createOpen = false },
        onPublish = { kindSel, textSel, consent, platforms ->
            scope.launch {
                val result = container.community.posts.create(
                    PostDraft(
                        idempotencyKey = UUID.randomUUID().toString(),
                        authorId = viewerId.value,
                        kind = kindSel,
                        text = textSel.trim(),
                        consent = consent,
                        shareTelemetryFacts = consent.shareTelemetryFacts,
                        distributionTargets = platforms.map { it.name },
                    ),
                )
                when (result) {
                    is PostResult.Created -> {
                        distribution.enqueue(
                            postId = result.post.id,
                            authorId = viewerId.value,
                            platforms = platforms.ifEmpty { listOf(DistributionPlatform.FITCONNECT) },
                            idempotencyKey = result.post.id,
                        )
                        distribution.processNext(10)
                        status = "Published ${result.post.id}"
                        reload()
                    }
                    is PostResult.Duplicate -> status = "Duplicate blocked"
                    PostResult.RateLimited -> status = "Rate limited"
                    PostResult.Invalid -> status = "Invalid post"
                }
            }
        },
    )
}

private val composerKinds = listOf(
    PostKind.TEXT,
    PostKind.WORKOUT,
    PostKind.TRAINING,
    PostKind.PROGRESS,
    PostKind.ACHIEVEMENT,
    PostKind.PHOTO,
    PostKind.SPOT,
    PostKind.MUSIC,
    PostKind.PERFORMANCE,
)

private val ReactionType.chipLabel: String
    get() = when (this) {
        ReactionType.LIKE -> "Like"
        ReactionType.FIRE -> "Fire"
        ReactionType.STRONG -> "Strong"
        ReactionType.CELEBRATE -> "Yes"
        ReactionType.SUPPORT -> "Support"
        ReactionType.INSIGHTFUL -> "Insight"
    }

private fun initialsOf(name: String): String =
    name.split(" ").mapNotNull { it.firstOrNull()?.uppercaseChar()?.toString() }.take(2).joinToString("").ifBlank { "FC" }

private fun relativeTime(createdAtEpochMs: Long, now: Long = System.currentTimeMillis()): String {
    val minutes = ((now - createdAtEpochMs).coerceAtLeast(0) / 60_000L)
    return when {
        minutes < 1 -> "now"
        minutes < 60 -> "${minutes}m"
        minutes < 1_440 -> "${minutes / 60}h"
        else -> "${minutes / 1_440}d"
    }
}

private fun workoutFactPairs(post: CommunityPost): List<Pair<String, String>> {
    val facts = post.workoutFacts ?: return emptyList()
    if (!post.shareTelemetryFacts) return emptyList()
    return listOfNotNull(
        facts.distanceMeters?.let { "KM" to "%.1f".format(it / 1000.0) },
        "MIN" to facts.durationMinutes.toString(),
        facts.avgHeartRate?.let { "HR" to "${it.toInt()}" },
    )
}
